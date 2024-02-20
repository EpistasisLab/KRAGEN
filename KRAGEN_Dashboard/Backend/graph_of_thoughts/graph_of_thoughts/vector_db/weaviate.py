import weaviate
import os
from openai import AzureOpenAI
import numpy as np
from typing import Dict
import json

weaviate_client = None

class WeaviateClient:
    def __init__(self, config_path):
        self.config: Dict = None
        self.load_config(config_path)
        self.config: Dict = self.config["weaviate"]
        self.url = self.config["url"]
        self.api_key = self.config["api_key"]
        self.db = self.config["db"]
        self.limit = self.config["limit"]
        self.client = self.get_client()
        
    def load_config(self, path: str) -> None:
        """
        Load configuration from a specified path.

        :param path: Path to the config file. If an empty path provided,
                     default is `config.json` in the current directory.
        :type path: str
        """
        if path == "":
            current_dir = os.path.dirname(os.path.abspath(__file__))
            path = os.path.join(current_dir, "config.json")

        with open(path, "r") as f:
            self.config = json.load(f)

        
    def get_client(self):
        auth_config = weaviate.AuthApiKey(api_key=self.api_key)
        global weaviate_client
        if weaviate_client is None:
            weaviate_client = weaviate.Client(
                url=self.url,
                auth_client_secret=auth_config
            )
        return weaviate_client
    
    def query_bm25(self, properties=["knowledge"], query_string="test", additional="score", limit=3):
        return ((self.client.query
            .get(self.db, properties))
            .with_bm25(
                query=query_string,
                properties=properties  # this does not need to be the same as columns
            )
            .with_additional(additional)
            .with_limit(limit)
            .do()
        )
    
    
    def query_near_text(self, properties=["knowledge"], near_text=["gene"], additional="score", limit=3):
        return ((self.client.query
            .get(self.db, properties))
            .with_near_text({
                "concepts": near_text
            })
            .with_limit(limit)
            .with_additional(additional)
            .do()
        )
    
    
    def query_my_near_text(self, prompt, properties=["knowledge"], additional="score", limit=3):
        vector = {
            "vector": prompt
        }
        # print(vector["vector"])
        return self.query_near_vector(self.db, properties, near_vector=vector, additional=additional, limit=limit)
    
    def query_near_vector(self, properties=["knowledge"], near_vector={}, additional="score", limit=3):
        return ((self.client.query
            .get(self.db, properties))
            .with_near_vector({'vector':near_vector})
            .with_limit(limit)
            .with_additional(additional)
            .do()
        )
    
    def query_with_hybrid(self, properties=["knowledge"], near_vector=[],  near_text='', additional="score", autocut=5):
        return ((self.client.query
            .get(self.db, properties))
            .with_hybrid(query = near_text, vector = near_vector, alpha = 0.25)
            # .with_limit(limit)
            .with_autocut(autocut)
            .with_additional(additional)
            .do()
        )
        
    def object_count(self):
        return ((self.client.query
            .aggregate(self.db)
            .with_meta_count()
            .do()))
        
    
    def get_knowledge(self,embedded_question, max_tokens=4000, max_distance = 0.3, min_score = 0.003, keyword_filter=''):
        if keyword_filter != '':
            knowledge_array = self.query_with_hybrid(near_vector=embedded_question, near_text=keyword_filter, additional=["score"])
        else:
            knowledge_array = self.query_near_vector(near_vector=embedded_question, additional=["distance"], limit=self.limit)
        # knowledge_array = self.query_near_vector(near_vector=embedded_question, additional=["distance"], limit=self.limit)
        knowledge_array = knowledge_array["data"]["Get"][self.config["db"]]
        # print(knowledge_array)
        in_context = []
        distances = []
        cur_tokens = 0
        for knowledge in knowledge_array:
            if keyword_filter != '' and keyword_filter.lower() not in knowledge["knowledge"].lower():
                continue

            if keyword_filter == '' :
                if knowledge['_additional']["distance"] > max_distance:
                    break
            else:
                if float(knowledge['_additional']["score"]) < min_score:
                    break
            
            cur_tokens += len(knowledge["knowledge"].split(" "))
            if cur_tokens > max_tokens:
                break
            in_context.append(knowledge["knowledge"])

            if keyword_filter == '' :
                distances.append(knowledge['_additional']["distance"])
            else:  
                distances.append(float(knowledge['_additional']["score"]))
            
        return in_context, distances
    

    
def get_answer(question,knowledge_array,temperature = 0, model = "gpt-35-turbo-16k"):
    in_context = "\n".join(knowledge_array)
    if model == "gpt-35-turbo-16k":
        client = AzureOpenAI(
            api_key=os.environ["OPENAI_KEY"],
            api_version="2023-07-01-preview",
            azure_endpoint = "https://caire-azure-openai.openai.azure.com/openai/deployments/gpt-35-turbo-16k/chat/completions?api-version=2023-07-01-preview"
            )
        deployment_name='gpt-35-turbo-16k' #This will correspond to the custom name you chose for your deployment when you deployed a model. 
    elif model == "gpt-4":
        client = AzureOpenAI(
            api_key=os.environ["OPENAI_KEY"],
            api_version="2023-07-01-preview",
            azure_endpoint = "https://caire-gpt4.openai.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2023-07-01-preview"
            )
        deployment_name = 'gpt-4'
        
    
    
    message_text = [{"role":"system","content":"""You are an Alzheimer's data specialist AI assistant dedicated to providing information and support related to Alzheimer's disease.
        Your primary goal is to assist users by offering factual and relevant information based on your access to a comprehensive knowledge graph associated with Alzheimer's. 
        Your responses are focused on addressing queries related to Alzheimer's, and you do not provide information unrelated to the topic. 
        You will also only answer based on the knowledge within the knowledge graph. 
        You will notice there will be gene symbols in the knowledge, and there are subtle differences between the gene names.
        You will need to be careful that the names are exact with you use them in context. There may be single differences in numbers and letters.
        For example, the gene "APOE" is not the same as gene "APOE1". Another example is the gene "IQCK" is not the same as gene "IQCG".
        You will need to be careful of specific biological terms. For example, the term "amino" is different from the term "amine".
        If you are providing a list, be sure not to list duplicates. 
        Your demeanor is empathetic and concise as you aim to help users understand and navigate Alzheimer's-related concerns."""},
                    {"role":"user","content":"Here is the knowledge from the knowledge graph: "+in_context+"\nThe question is: "+question}]
    
    # text that may help:
    # When you reply, please provide a followup response that includes the exact knowledge from the knowledge graph that you used to generate your response, and please do not include the knowledge that are not used.
    
    print(question)
    response = client.chat.completions.create(
        model=deployment_name, # model = "deployment_name".
        max_tokens=1000,
        messages=message_text,
        temperature=temperature
    )
    # response = client.completions.create(model=deployment_name, prompt=message_text, max_tokens=100)
    # print(response)
    # print(response.choices[0].message.content)
    return response.choices[0].message.content


# bm25 (keyword) search
# result = query_bm25(query_string="list all genes connected to alzheimers", limit=20)
# result = query_bm25(query_string="TPSAB1", additional="vector")
# result = query_bm25(query_string="TPSAB1", additional="id")
# result = query_bm25(query_string="TPSAB1", additional="distance") # returns: None

# # Similarity / Vector search
# near_vector = {
#     # what genes code for acetyl-CoA carboxylase?
# }
# result = query_near_vector(near_vector=near_vector, additional="distance", limit=10)

# My nearText search
# print(os.environ)

def condense_knowledge(knowledge_array):
    in_context = "\n".join(knowledge_array)
    client = AzureOpenAI(
        api_key=os.environ["OPENAI_KEY"],
        api_version="2023-07-01-preview",
        azure_endpoint = "https://caire-azure-openai.openai.azure.com/openai/deployments/gpt-35-turbo-16k/chat/completions?api-version=2023-07-01-preview"
        )
        
    deployment_name='gpt-35-turbo-16k' #This will correspond to the custom name you chose for your deployment when you deployed a model. 
    
    message_text = [{"role":"system","content":"""You are a data specialist AI assistant dedicated to providing a more concise version of the knowledge graph associated with Alzheimer's disease.
                     You will receive a fragmented list of knowledge from the knowledge graph, and you will need to condense the knowledge into a more concise version.
                     Be sure to include all the knowledge from the knowledge graph, and do not include knowledge that are not in the knowledge graph.
                     You will notice there will be gene symbols in the knowledge, and there are subtle differences between the gene names.
                     You will need to be careful that the names are exact with you use them in context. There may be single differences in numbers and letters.
                     For example, the gene "APOE" is not the same as gene "APOE1". Another example is the gene "IQCK" is not the same as gene "IQCG".
                     You will need to be careful of specific biological terms. For example, the term "amino" is different from the term "amine".
                     If you are providing a list, be sure not to list duplicates."""},
                    {"role":"user","content":"Here is the knowledge from the knowledge graph: "+in_context}]
    
    # text that may help:
    # When you reply, please provide a followup response that includes the exact knowledge from the knowledge graph that you used to generate your response, and please do not include the knowledge that are not used.
        
    response = client.chat.completions.create(
        model=deployment_name, # model = "deployment_name".
        max_tokens=1000,
        messages=message_text
    )
    return response.choices[0].message.content

def compare_answers(answer, ground_truth):
    client = AzureOpenAI(
        api_key=os.environ["OPENAI_KEY"],
        api_version="2023-07-01-preview",
        azure_endpoint = "https://caire-azure-openai.openai.azure.com/openai/deployments/gpt-35-turbo-16k/chat/completions?api-version=2023-07-01-preview"
        )
        
    deployment_name='gpt-35-turbo-16k' #This will correspond to the custom name you chose for your deployment when you deployed a model. 
    
    message_text = [{"role":"system","content":"""You are a data specialist AI that is comparing an answer to a ground truth.
                     You will receive an answer and a ground truth, and you will need to compare the answer to the ground truth.
                     In the end, you will need to provide a score between 0 and 1, where 0 is the worst score and 1 is the best score.
                     You will need to be careful that the names are exact with you use them in context. There may be single differences in numbers and letters.
                     For example, the gene "APOE" is not the same as gene "APOE1". Another example is the gene "IQCK" is not the same as gene "IQCG".
                     You will need to be careful of specific biological terms. For example, the term "amino" is different from the term "amine".
                     If you are comparing lists, be very sure that the lists are exactly the same and understand that it may not be in the same order."""},
                    {"role":"user","content":"Here is the answer: "+answer+"\nHere is the ground truth: "+ground_truth}]
    
    # text that may help:
    # When you reply, please provide a followup response that includes the exact knowledge from the knowledge graph that you used to generate your response, and please do not include the knowledge that are not used.
        
    response = client.chat.completions.create(
        model=deployment_name, # model = "deployment_name".
        max_tokens=1000,
        messages=message_text
    )
    return response.choices[0].message.content




def get_score_from_comparison(comparison):
    client = AzureOpenAI(
        api_key=os.environ["OPENAI_KEY"],
        api_version="2023-07-01-preview",
        azure_endpoint = "https://caire-azure-openai.openai.azure.com/openai/deployments/gpt-35-turbo-16k/chat/completions?api-version=2023-07-01-preview"
        )
        
    deployment_name='gpt-35-turbo-16k' #This will correspond to the custom name you chose for your deployment when you deployed a model. 
    
    message_text = [{"role":"system","content":"""You are a data specialist AI that is given a description of comparing an answer to the truth and possibly a numeric score.
                     You will extract the score from the description and output only the score.
                     Your output should not include any other text. For example, if the description is "The score is 0.5", you should output "0.5".
                     If there is no score, you will output nothing.
                     If there is no score, but determine that the description says it is a good answer, you will output "1"."""},
                    {"role":"user","content":"Here is the description: "+comparison}]
    
    # text that may help:
    # When you reply, please provide a followup response that includes the exact knowledge from the knowledge graph that you used to generate your response, and please do not include the knowledge that are not used.
        
    response = client.chat.completions.create(
        model=deployment_name, # model = "deployment_name".
        max_tokens=1000,
        messages=message_text
    )
    return response.choices[0].message.content

