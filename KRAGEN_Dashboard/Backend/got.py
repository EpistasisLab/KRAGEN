import os
import re
import logging
import datetime
import json
import csv
from statistics import fmean
from typing import Dict, List, Callable, Union
from graph_of_thoughts import controller, language_models, operations, prompter, parser
# from graph_of_thoughts.vector_db import azure_embedding



def strip_answer_helper(text: str, tag: str = "") -> str:
    """
    Helper function to remove tags from a text.

    :param text: The input text.
    :type text: str
    :param tag: The tag to be stripped. Defaults to "".
    :type tag: str
    :return: The stripped text.
    :rtype: str
    """

    text = text.strip()
    if "Output:" in text:
        text = text[text.index("Output:") + len("Output:") :].strip()
    if tag != "":
        start = text.rfind(f"<{tag}>")
        end = text.rfind(f"</{tag}>")
        if start != -1 and end != -1:
            text = text[start + len(f"<{tag}>") : end].strip()
        elif start != -1:
            logging.warning(
                f"Only found the start tag <{tag}> in answer: {text}. Returning everything after the tag."
            )
            text = text[start + len(f"<{tag}>") :].strip()
        elif end != -1:
            logging.warning(
                f"Only found the end tag </{tag}> in answer: {text}. Returning everything before the tag."
            )
            text = text[:end].strip()
        else:
            logging.warning(
                f"Could not find any tag {tag} in answer: {text}. Returning the full answer."
            )
    return text

class ALZKBPrompter(prompter.Prompter):
    """
    ALZKBPrompter provides the generation of prompts specific to the
    ALZKB example for the language models.

    Inherits from the Prompter class and implements its abstract methods.
    """
    
    alzkb_prompt_start = """You have access to a knowledge graph of Alzheimer's disease. The knowledge graph contains node types: Gene, DrugClass, Drug, Disease, Pathway, BiologicalProcess, MolecularFunction, CellularComponent, Symptom, BodyPart.
    The knowledge graph contains relationships: "CHEMICAL BINDS GENE","CHEMICAL INCREASES EXPRESSION", "CHEMICAL DECREASES EXPRESSION", "DRUG IN CLASS", "DRUG TREATS DISEASE", "DRUG CAUSES EFFECT", "GENE PARTICIPATES IN BIOLOGICAL PROCESS", "GENE IN PATHWAY", "GENE INTERACTS WITH GENE", "GENE HAS MOLECULAR FUNCTION", "GENE ASSOCIATED WITH CELLULAR COMPONENT", "GENE ASSOCIATES WITH DISEASE", "BODYPART OVER EXPRESSES GENE", "BODYPART UNDEREXPRESSES GENE", "SYMPTOM MANIFESTATION OF DISEASE", "DISEASE LOCALIZES TO ANATOMY", "DISEASE ASSOCIATES WITH DISEASE".
    """
    
    io_prompt = """<Instruction> You are an Alzheimer's data specialist AI assistant dedicated to providing information and support related to Alzheimer's disease.
Your primary goal is to assist users by offering factual and relevant information based on your access to a comprehensive knowledge graph associated with Alzheimer's. 
Your responses are focused on addressing queries related to Alzheimer's, and you do not provide information unrelated to the topic. 
You will also only answer based on the knowledge within the knowledge graph within the <Knowledge> tags. 
You will notice there will be gene symbols in the knowledge, and there are subtle differences between the gene names.
You will need to be careful that the names are exact with you use them in context. There may be single differences in numbers and letters.
For example, the gene "APOE" is not the same as gene "APOE1". Another example is the gene "IQCK" is not the same as gene "IQCG".
You will need to be careful of specific biological terms. For example, the term "amino" is different from the term "amine".
If you are providing a list, be sure not to list duplicates. 
Your demeanor is empathetic and concise as you aim to help users understand and navigate Alzheimer's-related concerns.
You will be provided knowledge within the <Knowledge> tags and must answer the question in the <Question> tags.
{additional_instruction}
</Instruction> 
<Knowledge>
{knowledge}
</Knowledge>
<Question>{question}</Question>"""
        
    few_shot_prompt = """<Instruction> You are an Alzheimer's data specialist AI assistant dedicated to providing information and support related to Alzheimer's disease.
Your primary goal is to assist users by offering factual and relevant information based on your access to a comprehensive knowledge graph associated with Alzheimer's. 
Your responses are focused on addressing queries related to Alzheimer's, and you do not provide information unrelated to the topic. 
You will also only answer based on the knowledge within the knowledge graph within the <Knowledge> tags. 
You will notice there will be gene symbols in the knowledge, and there are subtle differences between the gene names.
You will need to be careful that the names are exact with you use them in context. There may be single differences in numbers and letters.
For example, the gene "APOE" is not the same as gene "APOE1". Another example is the gene "IQCK" is not the same as gene "IQCG".
You will need to be careful of specific biological terms. For example, the term "amino" is different from the term "amine".
If you are providing a list, be sure not to list duplicates. 
Your demeanor is empathetic and concise as you aim to help users understand and navigate Alzheimer's-related concerns.
You will be provided knowledge within the <Knowledge> tags and must answer the question in the <Question> tags.
Your response should be within the <Output> tags.
{additional_instruction}
</Instruction> 
<Knowledge>
{knowledge}
</Knowledge>
<Question>{question}</Question>

<Approach>
To answer the question, follow these steps:
1. Identify the relevant nodes in the knowledge graph.
2. Identify the relevant relationships between the nodes.
3. Generate a response based on the identified nodes and relationships.
</Approach>

<Examples>
<Question>True or False Question: AP2M1 is not subject to decreased expression by the drug Botulinum toxin type A</Question>
<Reasoning>The knowledge graph contains the node AP2M1 and the node Botulinum toxin type A. The knowledge provided contains no link from AP2M1 to Botulinum toxin type A. Therefore, the answer is TRUE.</Reasoning>
<Output>True</Output>

<Question>Which of the following genes is not under-expressed in testis? 1. FLT1 2. TLE2 3. PDS5A 4. CSF1 5. MGST1</Question>
<Reasoning>In the knowledge graph, we detect that FLT1, TLE2, CSF1, MGST1 are associated with testis because the body part under-expresses the gene. We also detect that PDS5A is associated with testis because the body part over-expresses the gene. Therefore, the answer is PDS5A.</Reasoning>
<Output>3. PDS5A</Output>
</Examples>
"""

    cot_instruction_prompt = """You are an AI prompt simplifier with access to a knowledge graph of Alzheimer's disease. You will receive a query related to simplifying the query into parts that can be separated by relationship between nodes.
The knowledge graph contains node types: Gene, DrugClass, Drug, Disease, Pathway, BiologicalProcess, MolecularFunction, CellularComponent, Symptom, BodyPart. 
Gene nodes have gene type as a property.
The knowledge graph contains relationships: "CHEMICAL BINDS GENE","CHEMICAL INCREASES EXPRESSION", "CHEMICAL DECREASES EXPRESSION", "DRUG IN CLASS", "DRUG TREATS DISEASE", "DRUG CAUSES EFFECT", "GENE PARTICIPATES IN BIOLOGICAL PROCESS", "GENE IN PATHWAY", "GENE INTERACTS WITH GENE", "GENE HAS MOLECULAR FUNCTION", "GENE ASSOCIATED WITH CELLULAR COMPONENT", "GENE ASSOCIATES WITH DISEASE", "BODYPART OVER EXPRESSES GENE", "BODYPART UNDEREXPRESSES GENE", "SYMPTOM MANIFESTATION OF DISEASE", "DISEASE LOCALIZES TO ANATOMY", "DISEASE ASSOCIATES WITH DISEASE".
From the query, split it into multiple instructions of simple single node to Relationship to node format that would answer the query. Start the instructions from specifics node names. The format of each <Node> tag would be Node Title-Relationship-Node Title. If there are any specific nodes and not a node type, put a ! before and after the word. For instance, Alzheimer's is a specific Disease node, so it should be labeled "!Alzheimer's Disease!". Another example are of gene symbols, which are specific genes, so they should be labeled "!APOE!".
Each <Node> should contain a specific node and should not be between two node types. For instance, "Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!" is correct, but "Drug-DRUG TREATS DISEASE-Disease" is incorrect.
If you detect two specific keywords in the query, you can use both of them in a single <Node> tag. For instance, "!APOE!-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!" is correct, instead of having two separate <Node> tags.

<Examples> 
<Query>List the drugs that can treat Alzheimer's Disease</Query>
<Instructions>
<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>
</Instructions>

<Query>Provide a list of all genes associated with Alzheimer's Disease</Query>
<Instructions>
<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>
</Instructions>

<Query>Which classes of drugs can be used to treat Alzheimer's disease?</Query>
<Instructions>
<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>
<Node>DrugClass-DRUGINCLASS-Drug</Node>
</Instructions>

<Query>List ncRNA type genes that are associated with Alzheimer's Disease</Query>
<Instructions>
<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>
<Node>Gene-GeneType-!ncRNA!</Node>
</Instructions>

<Query>List the body parts overexpressing the gene ACE</Query>
<Instructions>
<Node>BodyPart-BODYPART OVEREXPRESSES GENE-!ACE!</Node>
</Instructions>

<Query>Which of the following genes is over-expressed in testis? 1. SEL1L 2. AKR7A2 3. TMCO6 4. MUTYH 5. GOLGA4</Query>
<Instructions>
<Node>!SEL1L!-BODYPART OVEREXPRESSES GENE-!Testis!</Node>
<Node>!AKR7A2!-BODYPART OVEREXPRESSES GENE-!Testis!</Node>
<Node>!TMCO6!-BODYPART OVEREXPRESSES GENE-!Testis!</Node>
<Node>!MUTYH!-BODYPART OVEREXPRESSES GENE-!Testis!</Node>
<Node>!GOLGA4!-BODYPART OVEREXPRESSES GENE-!Testis!</Node>
</Instructions>

<Query>List the drugs which commonly bind to the genes BTK and CYP1B1</Query>
<Instructions>
<Node>Gene-CHEMICAL BINDS GENE-!BTK!</Node>
<Node>Gene-CHEMICAL BINDS GENE-!CYP1B1!</Node>
</Instructions>

<Query>True or False Question: Amnesia is not a symptom of Prodromal Alzheimer's disease</Query>
<Instructions>
<Node>!Amnesia!-SYMPTOM MANIFESTATION OF DISEASE-!Prodromal Alzheimer's disease!</Node>
</Instructions>

<Query>True or False Question: Posaconazole binds to the gene CYP3A4</Query>
<Instructions>
<Node>!Posaconazole!-CHEMICAL BINDS GENE-!CYP3A4!</Node>
</Instructions>
</Examples>

<Query>{question}</Query
"""
    
    cot_single_focus_filter_knowledge_prompt = """<Instruction>You are an AI knowledge simplifier with access to a knowledge graph. You will be given a potential relationship within the <Statement> tags and also a loosely relevant set of knowledge within the <Knowledge> tags.
You should assume the <Statement> is false until proven true by an explicit connection provided by <Knowledge>.
Disregard any extraneous details or information not directly supporting the specified relationship.
There may be single differences in numbers and letters.
For example, the gene "APOE" is not the same as gene "APOE1". Another example is the gene "IQCK" is not the same as gene "IQCG".
You will need to be careful of specific biological terms. For example, the term "amino" is different from the term "amine".
There may be different forms of Alzheimer's disease and if the question is related to a specific form, you will need to answer based on that form. For instance, Prodromal Alzheimer's disease is a form of Alzheimer's disease and should not be confused with Alzheimer's disease.
Your response must be within <Output> tags.
</Instruction>

Here are some examples:
<Examples>
<Statement>BodyPart-BODYPART OVEREXPRESSES GENE-ACE</Statement>
<Knowledge>
The gene ACE is associated with the heart because the body part over-expresses the gene.
The gene HTRA2 is associated with the gene CAD because the gene interacts with the gene.
The gene ACE is associated with the lungs CAD because the body part over-expresses the gene.
</Knowledge>
<Output>
Gene ACE is associated with the heart and lungs because those body parts over-express the gene.
</Output>

<Statement>Drug-DRUG TREATS DISEASE-Alzheimer's Disease</Statement>
<Knowledge>
The drug Donepezil is associated with the disease Alzheimer's Disease because the drug treats the disease.
The drug Advil is associated with headaches because the drug treats headaches.
The drug Memantine is associated with the disease Alzheimer's Disease because the drug treats the disease.
The drug Mirapex is associated with the disease Parkinson's Disease because the drug treats the disease.
The drug Naltrexone is associated with the disease Alzheimer's Disease because the drug treats the disease.
</Knowledge>
<Output>
Drug Donepezil, Memantine, and Naltrexone are associated with Alzheimer's Disease because those drugs treat the disease.
</Output>

<Statement>Gene-GENE IN PATHWAY-Regulation of gap junction activity</Statement>
<Knowledge>
The gene GJD3 is involved in the molecular function gap junction channel activity
The gene TJP1 is involved in the Regulation of gap junction activity pathway because the gene is in the pathway
The gene GJC2 is involved in the molecular function gap junction channel activity
The gene GJA1 is involved in the Regulation of gap junction activity pathway because the gene is in the pathway
The gene GJC1 is involved in the molecular function gap junction channel activity
The gene MIP is involved in the molecular function gap junction channel activity
The gene GJB3 is involved in the molecular function gap junction channel activity
The gene SRC is involved in the Regulation of gap junction activity pathway because the gene is in the pathway
</Knowledge>
<Output>
Gene TJP1, GJA1, and SRC are involved in the Regulation of gap junction activity pathway because those genes are in the pathway.
</Output>
</Example>

Here is the statement and knowledge for this question:
<Statement>
{statement}
</Statement>
<Knowledge>
{knowledge}
</Knowledge>

Respond within the <Output> tags.
"""
    cot_double_focus_filter_knowledge_prompt = """<Instruction>You are an AI knowledge simplifier with access to a knowledge graph. You will be given a potential relationship within the <Statement> tags and also a loosely relevant set of knowledge within the <Knowledge> tags.
You should assume the <Statement> is false until proven true by an explicit connection provided by <Knowledge>.
Disregard any extraneous details or information not directly supporting the specified relationship.
There may be single differences in numbers and letters.
For example, the gene "APOE" is not the same as gene "APOE1". Another example is the gene "IQCK" is not the same as gene "IQCG".
You will need to be careful of specific biological terms. For example, the term "amino" is different from the term "amine".
There may be different forms of Alzheimer's disease and if the question is related to a specific form, you will need to answer based on that form. For instance, Prodromal Alzheimer's disease is a form of Alzheimer's disease and should not be confused with Alzheimer's disease.
Your response must be within <Output> tags.
</Instruction>

Here are some examples:
<Examples>
<Statement>
Clopidogrel-DRUG IN CLASS-Decreased Platelet Aggregation
</Statement>
<Knowledge>
The drug Clopidogrel is part of the Decreased Platelet Aggregation drug class because the chemical or drug in the drug class
The gene P2RY1 is involved in the Platelet Aggregation Inhibitor Pathway, Pharmacodynamics pathway because the gene is in the pathway
The gene CYP3A5 is involved in the Clopidogrel Metabolism Pathway pathway because the gene is in the pathway
The gene FGA is involved in the Platelet Aggregation (Plug Formation) pathway because the gene is in the pathway
The gene COL4A1 is involved in the Platelet Aggregation Inhibitor Pathway, Pharmacodynamics pathway because the gene is in the pathway
The drug Ticagrelor is part of the Decreased Platelet Aggregation drug class because the chemical or drug in the drug class
</Knowledge>
<Output>The drug Clopidogrel is part of the Decreased Platelet Aggregation drug class because the chemical or drug in the drug class</Output>

<Statement>Amnesia-SYMPTOM MANIFESTATION OF DISEASE-Prodromal Alzheimer's disease</Statement>
<Knowledge>
Amnesia is a symptom of Alzheimer's disease because the symptom manifests the disease.
</Knowledge>
<Output>
There is no connection between Amnesia and Prodromal Alzheimer's disease.
</Output>
</Example>

Use the following potential relationship and list of knowledge and respond within <Output> tags.
<Statement>
{statement}
</Statement>
<Knowledge>
{knowledge}
</Knowledge>

Respond within the <Output> tags.
"""

    got_answer_prompt = """<Instruction> You are an Alzheimer's data specialist AI assistant dedicated to providing information and support related to Alzheimer's disease.
Your primary goal is to assist users by offering factual and relevant information based on your access to a comprehensive knowledge graph associated with Alzheimer's. 
Your responses are focused on addressing queries related to Alzheimer's, and you do not provide information unrelated to the topic. 
You will also only answer based on the knowledge within the knowledge graph within the <Knowledge> tags. 
You will notice there will be gene symbols in the knowledge, and there are subtle differences between the gene names.
You will need to be careful that the names are exact with you use them in context. There may be single differences in numbers and letters.
For example, the gene "APOE" is not the same as gene "APOE1". Another example is the gene "IQCK" is not the same as gene "IQCG".
You will need to be careful of specific biological terms. For example, the term "amino" is different from the term "amine".
There may be different forms of Alzheimer's disease and if the question is related to a specific form, you will need to answer based on that form. For instance, Prodromal Alzheimer's disease is a form of Alzheimer's disease and should not be confused with Alzheimer's disease.
If you are providing a list, be sure not to list duplicates. 
Your demeanor is empathetic and concise as you aim to help users understand and navigate Alzheimer's-related concerns.
You will be provided knowledge within the <Knowledge> tags and must answer the question in the <Question> tags.
Your response should be within the <Output> tags.
{additional_instruction}
</Instruction>

<Examples>
<Question>List the diseases which localize to neuropil</Question>
<Knowledge>Alzheimer's Disease localizes to the olfactory nerve, dura mater, diagonal band of Broca, brain, telencephalon, nervous system, choroid plexus, corticospinal tract, central nervous system, embryo, locus ceruleus, neuropil, pupil, forebrain, and telencephalic ventricle.</Knowledge>
<Output>Alzheimer's Disease</Output>

<Question>True or False Question: Amnesia is not a symptom of Prodromal Alzheimer's disease</Question>
<Knowledge>There is no connection between Amnesia and Prodromal Alzheimer's disease.</Knowledge>
<Output>True</Output>

<Question>True or False Question: Clopidogrel belongs to the drug class Decreased Platelet Aggregation</Question>
<Knowledge>There is a connection between Clopidogrel and Decreased Platelet Aggregation</Knowledge>
<Output>True</Output>

</Examples>

<Knowledge>
{knowledge}
</Knowledge>
<Question>{question}</Question>
"""



    
    score_prompt_base = """We are comparing if a response is equivalent to the ground truth.
<GroundTruth>{ground_truth}</GroundTruth>
<Answer>{answer}</Answer>
Please score the response on a scale of 0 to 10, where 0 is not equivalent and 10 is equivalent.
You may have to compare two unordered lists, so please score the response based on the following criteria:
1. The lists contain the same number of elements.
2. The lists contain the same elements
3. The lists may contain the same elements in a different order and should be scored as equivalent.
If you have a True or False question, please score the response as 10 if the response is equal to the ground truth and 0 if the response is inequal.
You may provide reasoning for your scoring, but the final score should be between the tags <Score> and </Score>, without any additional text within those tags.
"""


    got_rephrase_prompt = """"""


    def __init__(self,vector_db, lm) -> None:
        """
        Inits the prompter.
        """
        self.vector_db = vector_db
        self.lm = lm
        pass

    def extract_details(self, question_type: str, question: str ) -> None:
        if question_type == "true/false":
            additional_instruction = "You will be asked to answer the question with only a TRUE or FALSE response."
            # check if "True or False Question: " is in the question
            if "True or False Question: " in question:
                statement_to_embed = question[question.index("True or False Question: ") + len("True or False Question: "):]
            else:
                statement_to_embed = question
                question = "True or False Question: " + question
        elif question_type == "multiple choice":
            additional_instruction = "You will be asked to answer the question with only the multiple choice number response. For instance, if the correct answer is '2', you will need to answer '2'."
            # check if "? 1." is in the question and separate the question from the choice
            if "? 1." in question:
                statement_to_embed = question[:question.index("? 1.")]
            else:
                statement_to_embed = question
        elif question_type == "list":
            additional_instruction = "You will be asked to answer the question with only the list with each element separated by a newline."
            statement_to_embed = question
        else:
            additional_instruction = ""
            statement_to_embed = question
        return statement_to_embed, additional_instruction, question
     
    def aggregation_prompt(self, state_dicts: List[Dict], **kwargs) -> str:
        """
        Generate an aggregation prompt for the language model.

        :param state_dicts: The thought states that should be aggregated.
        :type state_dicts: List[Dict]
        :param kwargs: Additional keyword arguments.
        :return: The aggregation prompt.
        :rtype: str
        :raise AssertionError: If not exactly two thought states are provided.
        """
        print("aggregation_prompt")
        state_dicts = state_dicts[0]
        print(state_dicts)

        statement_to_embed, additional_instruction, question = self.extract_details(state_dicts["question_type"], state_dicts["question"])
        print("statement_to_embed:", statement_to_embed)
        print("question:", question)
        print("additional_instruction:", additional_instruction)

        prompt = ""
        # assert len(state_dicts) == 2, "Expected two states for aggregation prompt."
        prompt += self.few_shot_prompt.format(question = question, knowledge=state_dicts["knowledge"], additional_instruction=additional_instruction)
        print(prompt)
        return prompt

    def generate_prompt(
        self,
        num_branches: int,
        question: str,
        question_type: str,
        method: str,
        current: str,
        **kwargs,
    ) -> str:
        """
        Generate a generate prompt for the language model.

        :param num_branches: The number of responses the prompt should ask the LM to generate.
        :type num_branches: int
        :param question: The question to be answered.
        :type question: str
        :param question_type: The type of the question.
        :type question_type: str
        :param method: The method used to generate the prompt.
        :type method: str
        :param current: The intermediate solution.
        :type current: str
        :param kwargs: Additional keyword arguments.
        :return: The generate prompt.
        :rtype: str
        :raise AssertionError: If method is not implemented yet.
        """
        
        statement_to_embed, additional_instruction, question = self.extract_details(question_type, question)
            
        # print("statement_to_embed:", statement_to_embed)
        # print("question:", question)
        if method.startswith("io") or method.startswith("fewshot") or method.startswith("cot") or (method.startswith("got") and kwargs["phase"] > 0):
            if method.startswith("got"):
                # print("kwargs:",kwargs)
                if kwargs["phase"] == 1 and "edges" in kwargs and "edge_id" in kwargs and kwargs["edge_id"] < len(kwargs["edges"]):
                    statement_to_embed = kwargs["edges"][kwargs["edge_id"]]
                    # may have ! in side the statement_to_embed so it'll be removed for embedding
                    #count the number of ! in the statement_to_embed to determine if it's a specific node or a node type
                    if statement_to_embed.count("!") >= 2:
                        statement_to_embed_cleaned = statement_to_embed.replace("!","")
                        # print("getting knowledge to statement:", statement_to_embed_cleaned)
                        embedded_question = self.lm.get_embedding(statement_to_embed_cleaned)
                        #get the word in between the ! and embed it. there may be multiple ! so get each word in between the !
                        node_filters = re.findall(r'!(.*?)!', statement_to_embed)
                        # print("node_filter:", node_filter)
                        knowledge_arrays = []
                        for node_filter in node_filters:
                            # print("node_filter:", node_filter)
                            knowledge_array,distances = self.vector_db.get_knowledge(embedded_question, keyword_filter = node_filter)
                            if len(node_filters) > 1:
                                for node_filter in node_filters:
                                    # remove knowledge that doesn't contain the node_filter
                                    # knowledge_array = [knowledge for knowledge in knowledge_array if node_filter in knowledge]
                                    knowledge_array = [knowledge for knowledge in knowledge_array if node_filter.lower() in knowledge.lower()]
                            knowledge_arrays.append(knowledge_array)
                        # get the unique union of the knowledge arrays
                        knowledge_array = list(set().union(*knowledge_arrays))
                        knowledge = "\n".join(knowledge_array)
                        # print(knowledge)
                    else:
                        # print("getting knowledge to statement:", statement_to_embed)
                        embedded_question = self.lm.get_embedding(statement_to_embed)
                        knowledge_array,distances = self.vector_db.get_knowledge(embedded_question)
                        knowledge = "\n".join(knowledge_array)
                
            else:
                # print("getting knowledge to statement:", statement_to_embed)
                embedded_question = self.lm.get_embedding(statement_to_embed)
                knowledge_array,distances = self.vector_db.get_knowledge(embedded_question)
                knowledge = "\n".join(knowledge_array)
        
        prompt = ""
        assert num_branches == 1, "Branching should be done via multiple requests."
        if method.startswith("io"):
            # print(self.io_prompt.format(knowledge=knowledge, question=question, additional_instruction=additional_instruction))
            return self.io_prompt.format(knowledge=knowledge, question=question, additional_instruction=additional_instruction)
        elif method.startswith("fewshot"):
            return self.few_shot_prompt.format(knowledge=knowledge, question=question, additional_instruction=additional_instruction)
        elif method.startswith("cot"):
            if (current is None or current == "") and kwargs["phase"] == 0:
                return self.cot_instruction_prompt.format(question=question)
            else:
                prompt += self.cot_prompt.format(knowledge=knowledge, question=question, additional_instruction=additional_instruction)
                return prompt
        elif method.startswith("got"):
            if (current is None or current == "") and kwargs["phase"] == 0:
                return self.cot_instruction_prompt.format(question=question)
            else:
                # print("generate prompt kwargs:", kwargs)
                if "edge_id" in kwargs and "edges" in kwargs and kwargs["edge_id"] < len(kwargs["edges"]) and kwargs["phase"] == 1:
                    if statement_to_embed.count("!") == 2:
                        prompt += self.cot_single_focus_filter_knowledge_prompt.format(statement = statement_to_embed_cleaned, knowledge=knowledge)
                    elif statement_to_embed.count("!") == 4:
                        prompt += self.cot_double_focus_filter_knowledge_prompt.format(statement = statement_to_embed_cleaned, knowledge=knowledge)
                    else:
                        prompt += self.cot_single_focus_filter_knowledge_prompt.format(statement = statement_to_embed, knowledge=knowledge)
                elif kwargs["phase"] == 2:
                    prompt = ""
                    # assert len(state_dicts) == 2, "Expected two states for aggregation prompt."
                    # print(kwargs["knowledge"])
                    prompt += self.got_answer_prompt.format(question = question, knowledge="\n".join(kwargs["knowledge"])       , additional_instruction=additional_instruction)
                    # print(prompt)

                    # prompt += self.io_prompt.format(knowledge=kwargs["phase"], question=question, additional_instruction=additional_instruction)
                    # prompt += self.cot_aggregate_prompt.format(question = question, knowledge=kwargs["phase"])
                else:
                    print("no prompt")
                    prompt += ""
                return prompt
        else:
            assert False, "Not implemented yet."

    def improve_prompt(self, **kwargs) -> str:
        """
        Generate an improve prompt for the language model.

        :param kwargs: Additional keyword arguments.
        :return: The improve prompt.
        :rtype: str
        """
        pass

    def validation_prompt(self, **kwargs) -> str:
        """
        Generate a validation prompt for the language model.

        :param kwargs: Additional keyword arguments.
        :return: The validation prompt.
        :rtype: str
        """
        pass

    def score_prompt(self, state_dicts: List[Dict], **kwargs) -> str:
        """
        Generate a score prompt for the language model.

        :param state_dicts: The thought states that should be scored,
                            if more than one, they should be scored together.
        :type state_dicts: List[Dict]
        :param kwargs: Additional keyword arguments.
        :return: The score prompt.
        :rtype: str
        :raise AssertionError: If more than one thought state is supplied.
        """
        print("scoring (got answer):", state_dicts[0]["current"])
        print("scoring (ground truth):", state_dicts[0]["ground_truth"])
        # perform individual scoring
        prompt = self.score_prompt_base.format(
            answer=state_dicts[0]["current"],
            ground_truth=state_dicts[0]["ground_truth"],
        )
        return prompt
    
class ALZKBParser(parser.Parser):
    """
    ALZKBParser provides the parsing of language model reponses specific to the
    ALZKB example.

    Inherits from the Parser class and implements its abstract methods.
    """

    def __init__(self) -> None:
        """
        Inits the response cache.
        """
        self.cache = {}

    def parse_aggregation_answer(
        self, states: List[Dict], texts: List[str]
    ) -> Union[Dict, List[Dict]]:
        """
        Parse the response from the language model for an aggregation prompt.

        :param states: The thought states used to generate the prompt.
        :type states: List[Dict]
        :param texts: The responses to the prompt from the language model.
        :type texts: List[str]
        :return: The new thought states after parsing the respones from the language model.
        :rtype: Union[Dict, List[Dict]]
        :raise AssertionError: If not exactly two thought states are provided.
        """
        print("parse_aggregation_answer text:", texts)
        # print(states)
        assert len(states) == 2, "Expected two states for aggregation answer."
        new_states = []
        for text in texts:
            answers = text.strip().split("\n")
            if any(["Output" in answer for answer in answers]):
                # cut elements until last output is found
                for answer in reversed(answers):
                    if "Output" in answer:
                        answers = answers[answers.index(answer) :]
                        break

            answers_stripped = [
                answer for answer in answers if "[" in answer and "]" in answer
            ]
            if len(answers_stripped) == 0:
                for answer in answers:
                    answer = "[" + answer + "]"
                    try:
                        answer_converted = utils.string_to_list(answer)
                        if len(answer_converted) > 0:
                            answers_stripped.append(answer)
                    except:
                        pass
            if len(answers_stripped) == 0:
                logging.warning(
                    f"Could not parse aggregation answer: {text}. Returning empty list."
                )
                answer = "[]"
            else:
                answer = [
                    answer[answer.index("[") : answer.index("]") + 1]
                    for answer in answers_stripped
                ][0]
            states = sorted(states, key=lambda x: x["part"])
            merged_subsets = states[0]["subset"][:-1] + ", " + states[1]["subset"][1:]
            new_state = states[0].copy()
            new_state["current"] = answer
            new_state["subset"] = merged_subsets
            new_states.append(new_state)
        return new_states

    def parse_improve_answer(self, state: Dict, texts: List[str]) -> Dict:
        """
        Parse the response from the language model for an improve prompt.

        :param state: The thought state used to generate the prompt.
        :type state: Dict
        :param texts: The responses to the prompt from the language model.
        :type texts: List[str]
        :return: The new thought state after parsing the responses from the language model.
        :rtype: Dict
        """
        pass

    def parse_generate_answer(self, state: Dict, texts: List[str]) -> List[Dict]:
        """
        Parse the response from the language model for a generate prompt.

        :param state: The thought state used to generate the prompt.
        :type state: Dict
        :param texts: The responses to the prompt from the language model.
        :type texts: List[str]
        :return: The new thought states after parsing the respones from the language model.
        :rtype: List[Dict]
        """

        new_states = []
        # print("parse_generate_answer text:", texts)

        
        for text in texts:
            if state["method"].startswith("io") or state["method"].startswith("fewshot"):
                try:
                    if state["method"].startswith("fewshot"):
                        #remove <Output> tag
                        text = strip_answer_helper(text, "Output")
                    if state["question_type"] == "true/false":
                        if "TRUE" in text.upper():
                            answer = "TRUE"
                        elif "FALSE" in text.upper():
                            answer = "FALSE"
                        else:
                            answer = "FALSE"
                    elif state["question_type"] == "multiple choice":
                        #white strip to remove any spaces and check for numbers in the first couple of characters
                        if any(char.isdigit() for char in text[:3]):
                            answer = text[0]
                        else:
                            logging.warning(
                                f"Could not parse step answer: {text}. Returning empty."
                            )
                            continue
                    elif state["question_type"] == "list":
                        temp_answer = text.strip().split("\n")
                        answer = [x for x in temp_answer if x != '']
                        #check for empty answers
                        if len(answer) == 0:
                            logging.warning(
                                f"Could not parse step answer: {text}. Returning empty."
                            )
                            continue
                        
                    else:
                        answer = text.strip()
                        
                        
                    new_state = state.copy()
                    new_state["current"] = answer
                    new_state["phase"] = new_state["phase"] + 1
                    new_states.append(new_state)
                except Exception as e:
                    logging.error(
                        f"Could not parse step answer: {text}. Encountered exception: {e}"
                    )
                        
            elif state["method"].startswith("cot"):
                try:
                    if state["phase"] == 0:
                        answer = strip_answer_helper(text, "Instructions")
                    else:
                        answer = strip_answer_helper(text, "Node")
                    # print(answer)
                    new_state = state.copy()
                    new_state["current"] = answer
                    new_state["phase"] = new_state["phase"] + 1
                    new_states.append(new_state)
                except Exception as e:
                    logging.error(
                        f"Could not parse step answer: {text}. Encountered exception: {e}"
                    )
            elif state["method"].startswith("got"):
                # We expect a json which contains the two lists named "List 1" and "List 2"
                # cut everything until the opening bracket and everything after the closing bracket
                try:
                    # logging.info("state: %s", text)
                    # print("text:",text)
                    if state["phase"] == 0:
                        answer = strip_answer_helper(text, "Instructions")
                        instructions = answer.strip().split("\n")
                        # print("Instructions:",instructions)
                        #run strip_answer_helper on each instruction
                        instructions = [strip_answer_helper(instruction, "Node") for instruction in instructions]
                    elif state["phase"] == 1 and "<Output>" not in text:
                        #in the case that the knowledge simplifier is used, sometimes the answer is not within the Output tag
                        answer = text.strip()
                    else:
                        answer = strip_answer_helper(text, "Output")
                    new_state = state.copy()
                    if state["phase"] == 0:
                        new_state["edges"] = instructions
                        new_state["phase"] = 1
                        # if state["method"] contains dynamic, then we need to generate the successors
                        if "dynamic" in state["method"]:
                            new_state["generate_successors"] = len(instructions)
                        new_states.append(new_state)
                    elif state["phase"] == 1:
                        if "generate_successors" in new_state:
                            #remove
                            new_state.pop("generate_successors")
                        new_state["current"] = answer
                        if "knowledge" not in new_state:
                            new_state["knowledge"] = []
                        new_state["knowledge"].append(answer)
                        if state["edge_id"] == len(state["edges"]) - 1:
                            new_state["phase"] = 2
                        
                        new_states.append(new_state)
                    elif state["phase"] == 2:
                        new_state["current"] = answer
                        new_state["phase"] = new_state["phase"] + 1
                        new_states.append(new_state)
                    # else:
                    #     new_state["current"] = answer
                    #     new_state["phase"] = new_state["phase"] + 1
                    #     new_states.append(new_state)
                    # print("new_state:", new_state)
                except Exception as e:
                    logging.error(
                        f"Could not parse step answer: {text}. Encountered exception: {e}"
                    )
            else:
                answers = text.strip().split("\n")
                answers = [
                    answer for answer in answers if "[" in answer and "]" in answer
                ]
                if any(["Output" in answer for answer in answers]):
                    # cut elements until last output is found
                    for answer in reversed(answers):
                        if "Output" in answer:
                            answers = answers[answers.index(answer) :]
                            break

                answers = [
                    answer[answer.index("[") : answer.index("]") + 1]
                    for answer in answers
                ]
                if len(answers) == 0:
                    logging.warning(
                        f"Could not parse step answer: {text}. Returning empty list."
                    )
                    answer = "[]"
                else:
                    if len(answers) > 1:
                        logging.warning(
                            f"Multiple answers found for step answer: {text}. Using the first one."
                        )
                    answer = answers[0]

                new_state = state.copy()
                new_state["current"] = answer
                new_state["phase"] = 2
                new_states.append(new_state)
        
        return new_states

    def parse_validation_answer(self, state: Dict, texts: List[str]) -> bool:
        """
        Parse the response from the language model for a validation prompt.

        :param state: The thought state used to generate the prompt.
        :type state: Dict
        :param texts: The responses to the prompt from the language model.
        :type texts: List[str]
        :return: Whether the thought state is valid or not.
        :rtype: bool
        """
        pass

    def parse_score_answer(self, states: List[Dict], texts: List[str]) -> List[float]:
        """
        Parse the response from the language model for a score prompt.

        :param states: The thought states used to generate the prompt.
        :type states: List[Dict]
        :param texts: The responses to the prompt from the language model.
        :type texts: List[str]
        :return: The scores for the thought states.
        :rtype: List[float]
        """
        assert len(states) == 1, "Only one state is allowed for scoring."
        if len(states) == 1:
            # individual scoring
            redundancy_scores = []
            retain_scores = []
            for text in texts:
                answer = strip_answer_helper(text, "Score")
                # print("text:", text)
                print("assessed score:", answer)
                #check if the answer is a number whether it's a float or an integer
                res = re.findall(r"/d+/.?/d*", answer)
                if answer.isnumeric():
                    redundancy_scores.append(float(answer))
                elif len(res) == 1:
                    redundancy_scores.append(float(res[0]))
                elif len(res) > 1:
                    logging.warning(
                        f"Found multiple scores in answer: {text}. Returning the last one."
                    )
                    redundancy_scores.append(float(res[-1]))
                else:
                    logging.warning(
                        f"Could not find any score in answer: {text}. Ignoring this answer."
                    )
            if len(redundancy_scores) == 0:
                logging.warning(
                    f"Could not find any valid score in any answer. Returning 0.0."
                )
                return [0.0]
            mean_redundancy = fmean(redundancy_scores)
            # print("mean_score:", mean_redundancy)
            return [mean_redundancy]
            # mean_retain = fmean(retain_scores)
            # f1 = 2 * mean_redundancy * mean_retain / (mean_redundancy + mean_retain)
            # return [f1]
