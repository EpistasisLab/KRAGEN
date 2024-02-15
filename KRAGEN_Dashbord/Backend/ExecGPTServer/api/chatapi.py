from flask import Blueprint, jsonify, request
from flask_cors import CORS, cross_origin
from ..utils import chat_util
import got
from graph_of_thoughts import controller, language_models, operations
# from graph_of_thoughts.vector_db.weaviate import WeaviateClient
import json
import math
import logging
import time
import sys 

from got import ALZKBPrompter, ALZKBParser

bp = Blueprint('chatapi', __name__, url_prefix='/chatapi/v1')

# Enable CORS on the blueprint
CORS(bp, origins='http://localhost:3000')

@bp.route('/chats', methods=['POST'])
@bp.route('/chats/<int:chat_id>', methods=['GET', 'PATCH', 'DELETE'])
@cross_origin() 
def chat(chat_id=None):
    if request.method == 'GET':
        result = chat_util.get_chat(chat_id)
    elif request.method == 'POST':
        req = request.get_json()
        if 'title' not in req:
            return jsonify({'error': 'Missing title parameter'}), 400
        result = chat_util.create_chat(req['title'])
    elif request.method == 'PATCH':
        req = request.get_json()
        if 'title' not in req:
            return jsonify({'error': 'Missing title parameter'}), 400
        result = chat_util.update_chat(req['title'], chat_id)
    else:
        result = chat_util.delete_chat(chat_id)

    # if 'error' in result and result['error'] is not None:
    if 'error' in result:
        return jsonify({'error': result['error']}), 500

    return jsonify(result), 200


@bp.route('/chattitle/<int:chat_id>', methods=['GET','PATCH'])
@cross_origin()
def getChatTitle(chat_id):
    # if GET
    if request.method == 'GET':
        result = chat_util.get_chat_title(chat_id)

    # if PATCH
    elif request.method == 'PATCH':
        data = request.get_json()
        title = data.get('title')
        print("TITLE: ", title)
        if title is None:
            return jsonify({'error': 'Title is required'}), 400
    
        result = chat_util.update_chat_title(chat_id, title)
    return jsonify(result), 200



@bp.route('/chats/<int:chat_id>/chatlogs', methods=('GET', 'POST'))
@bp.route('/chats/<int:chat_id>/chatlogs/<int:chatlog_id>', methods=['PATCH'])
@cross_origin() 
def chatlogs(chat_id, chatlog_id=None):
    result = {}
    if request.method == 'GET':
        result = chat_util.get_chatlogs(chat_id)

    elif request.method == 'POST':
        req = request.get_json()
        req['chat_id'] = chat_id

        if 'message' not in req:
            return jsonify({'error': 'Missing message parameter'}), 400

        if not isinstance(req['message'], str):
            return jsonify({'error': 'message parameter must be a string'}), 400

        if 'message_type' not in req:
            return jsonify({'error': 'Missing message_type parameter'}), 400

        if not isinstance(req['message_type'], str):
            return jsonify({'error': 'message_type parameter must be a string'}), 400

        if 'who' not in req:
            return jsonify({'error': 'Missing who parameter'}), 400

        if not isinstance(req['who'], str):
            return jsonify({'error': 'who parameter must be a string'}), 400

        if 'execution_id' in req and not isinstance(req['execution_id'], int):
            return jsonify({'error': 'execution_id parameter must be an integer'}), 400

        if 'src_code' in req and not isinstance(req['src_code'], str):
            return jsonify({'error': 'src_code parameter must be a string'}), 400

        result = chat_util.add_chatlog(req)

    elif request.method == 'PATCH':
        req = request.get_json()
        req['chat_id'] = chat_id
        req['chatlog_id'] = chatlog_id

        result = chat_util.update_chatlog(req)

    # if result['error'] is not None:
    if 'error' in result:
        return jsonify({'error': result['error']}), 500

    return jsonify(result), 200


# count the number of chatids
@bp.route('/chats/count', methods=['GET'])
@cross_origin()
def count():
    result = chat_util.count_chatids()
    return jsonify(result), 200


# return all chatids
@bp.route('/chats/chatids', methods=['GET'])
@cross_origin()
def chatids():
    result = chat_util.get_chatids()
    return jsonify(result), 200


# get json GoT response
@bp.route('/got', methods=['GET'])
@cross_origin()
def got():
    question = "True or False Question: AP2M1 is not subject to decreased expression by the drug Botulinum toxin type A"
    answer = "TRUE"
    question_type = "true/false"

    # question= "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2"
    # answer = "heart"
    # question_type = "list"

    # question = "List the genes in the pathway Regulation of gap junction activity"
    # answer= "TJP1, SRC, GJA1"
    # question_type = "list"

    question = "List the diseases which localize to neuropil"
    answer = "Alzheimer's Disease"
    question_type = "list"

    question = "Amnesia is not a symptom of Prodromal Alzheimer's disease"
    answer = "TRUE"
    question_type = "true/false"

    question = "Alzheimer's Disease is not be treated by the drug Muromonab"
    answer = "TRUE"
    question_type = "true/false"

    question = "Posaconazole binds to the gene CYP3A4"
    answer = "TRUE"
    question_type = "true/false"


    question = "Clopidogrel belongs to the drug class Decreased Platelet Aggregation"
    answer = "TRUE"
    question_type = "true/false"

    question = "POGLUT3 is not a gene which interacts with the gene NR2F6"
    answer = "TRUE"
    question_type = "true/false"

    # question = "Olopatadine increases the gene expression of KLHL9"
    # answer = "TRUE"
    # question_type = "true/false"

    question = "Which of the following genes is over-expressed in testis? 1. SEL1L 2. AKR7A2 3. TMCO6 4. MUTYH 5. GOLGA4"
    answer= "5"
    question_type = "multiple choice"

    # question = "which genes are over-expressed in the testis"
    # answer = ""
    # question_type = "list"

    # question = "Is the gene SEL1L over-expressed in the testis?"
    # answer = "FALSE"
    # question_type = "true/false"


    def got_dynamic() -> operations.GraphOfOperations:
        """
        Generates the Graph of Operations for the IO method.

        :return: Graph of Operations
        :rtype: GraphOfOperations
        """
        operations_graph = operations.GraphOfOperations()

        instruction_node = operations.Generate(1, 1)
        operations_graph.append_operation(instruction_node)
        
        return operations_graph
    # Retrieve the Graph of Operations
    got_dynamic = got_dynamic()

    config_file = "config.json"
    # config_file = "config_v1.json"

    # Configure the Language Model (Assumes config.json is in the current directory with OpenAI API key)
    lm = language_models.AzureGPT(config_file, model_name="azuregpt")
    vdb = WeaviateClient(config_file)

    # Create the Controller
    try:
        ctrl = controller.Controller(
        lm, 
        got_dynamic, 
        ALZKBPrompter(vdb,lm), 
        ALZKBParser(),
        # The following dictionary is used to configure the initial thought state
        {
            "question": question,
            "ground_truth" : answer,
            "question_type": question_type,
            "current": "",
            "phase": 0,
            # "method": "cot"
            "method" : "got_dynamic"
        }
        )
        # ctrl.logger.addHandler(logging.StreamHandler(sys.stdout))
        # ctrl.logger.setLevel(logging.INFO)

        # Run the Controller and generate the output graph
        ctrl.run()
    except Exception as e:
        print("exception:",e)
    # delete the controller to free up memory

    # print(ctrl.graph.operations)
    #clear up logger
    ctrl.logger.handlers = []
    ctrl.logger = None

    operations_graph = ctrl.graph.operations
    del ctrl
    
        
    output = []
    # for operation in operations_log['MCQ_1hop.json']['Which of the following binds to the drug Leucovorin? 1. CAD 2. PDS5B 3. SEL1L 4. ABCC2 5. RMI1']:
    # print(len(operations_graph))
    index = 0
    operation = operations_graph[0]
    
    #get length of operations_graph
    while len(operation.successors) > 0:
        index = index + 1
        operation = operation.successors[0]
        
    # print(index)
    operation_size = index
    # print("operation_size", operation_size)
    index = 0
    num_of_branches = int((operation_size-2)/2)
    operation = operations_graph[0]
    while len(operation.successors) > 0:
    # for operation in operations_graph:
        
        if index == 0:
            x = 0
            y = 40
        elif index == operation_size-1:
            x = 0
            y = 10
        elif index < operation_size-1:
            #if num_of_branches is even
            if num_of_branches % 2 == 0:
                x_left = -10 - 20*math.floor(num_of_branches/2)
            else:
                x_left = -20*math.floor(num_of_branches/2)
            x = x_left + (math.floor((index-1)/2))*20
            if index % 2 == 0:
                y = 20
            else:
                y = 30
            
        if operation.operation_type.name == "generate":
            label = "Generate"
            cluster = "2"
        elif operation.operation_type.name == "selector":
            label = "Selector"
            cluster = "1"
        operation_serialized = {
            "key": "node_"+str(index),
            #uppercase the first letter of the operation type
            "label": label,
            "tag": label,
            "URL": "",
            "cluster": cluster,
            "x": x,
            "y": y,
            "sizenode": 30,
            
            "thoughts": [thought.state for thought in operation.get_thoughts()],
        }
        # print(operation_serialized["thoughts"][0]["prompt"])
        if any([thought.scored for thought in operation.get_thoughts()]):
            operation_serialized["scored"] = [
                thought.scored for thought in operation.get_thoughts()
            ]
            operation_serialized["scores"] = [
                thought.score for thought in operation.get_thoughts()
            ]
        if any([thought.validated for thought in operation.get_thoughts()]):
            operation_serialized["validated"] = [
                thought.validated for thought in operation.get_thoughts()
            ]
            operation_serialized["validity"] = [
                thought.valid for thought in operation.get_thoughts()
            ]
        if any(
            [
                thought.compared_to_ground_truth
                for thought in operation.get_thoughts()
            ]
        ):
            operation_serialized["compared_to_ground_truth"] = [
                thought.compared_to_ground_truth
                for thought in operation.get_thoughts()
            ]
            operation_serialized["problem_solved"] = [
                thought.solved for thought in operation.get_thoughts()
            ]
        output.append(operation_serialized)
        index = index + 1
        operation = operation.successors[0]
        
    #Question node
    output.append({
      "key": "node_-1",
      "label": "Question",
      "tag": "Question",
      "URL": "",
      "cluster": "0",
      "x": 0,
      "y": 50,
      "sizenode": 30,
      "thoughts": [
        {
          "question": question
        }
      ]
    })
    
    #Answer node
    output.append({
        "key": "node_"+str(operation_size),
        "label": "Answer",
        "tag": "Answer",
        "URL": "",
        "cluster": "3",
        "x": 0,
        "y": 0,
        "sizenode": 30,
        "thoughts": [
            {
                "answer": answer
            }
        ]
    })
    
    edge_data = []
    for i in range(num_of_branches):
        edge_data.append(["node_0", "node_"+str(i*2+1)])
        edge_data.append(["node_"+str(i*2+1), "node_"+str(i*2+2)])
        edge_data.append(["node_"+str(i*2+2), "node_"+str(operation_size-1)])
    # print(json.dumps(output, indent=4))
    # print(json.dumps(edge_data, indent=4))
    edge_data.append(["node_-1", "node_0"])
    edge_data.append(["node_"+str(operation_size-1), "node_"+str(operation_size)])
    
    
    
    result = {
        "question": question,
        "answer": answer,
        "edges": edge_data,
        "clusters": [
            { "key": "0", "color": "#00ffbc", "clusterLabel": "Question" },
            { "key": "1", "color": "#ff004f", "clusterLabel": "Generate" },
            { "key": "2", "color": "#23a6d5", "clusterLabel": "Selector" },
            { "key": "3", "color": "#f9a11b", "clusterLabel": "Answer" }
        ],
        "tags": [
            { "key": "Question", "image": "question.svg" },
            { "key": "Generate", "image": "generator.svg" },
            { "key": "Selector", "image": "selector.svg" },
            { "key": "Answer", "image": "answer.svg" }
        ],
        "nodes": output
    }
    
    return jsonify(result), 200

    result = {
  "nodes": [
    {
      "key": "node_-1",
      "label": "Question",
      "tag": "Question",
      "URL": "",
      "cluster": "0",
      "x": 0,
      "y": 45,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "",
          "phase": 1,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "You are an AI prompt simplifier with access to a knowledge graph of Alzheimer's disease. You will receive a query related to simplifying the query into parts that can be separated by relationship between nodes.\nThe knowledge graph contains node types: Gene, DrugClass, Drug, Disease, Pathway, BiologicalProcess, MolecularFunction, CellularComponent, Symptom, BodyPart. \nGene nodes have gene type as a property.\nThe knowledge graph contains relationships: \"CHEMICAL BINDS GENE\",\"CHEMICAL INCREASES EXPRESSION\", \"CHEMICAL DECREASES EXPRESSION\", \"DRUG IN CLASS\", \"DRUG TREATS DISEASE\", \"DRUG CAUSES EFFECT\", \"GENE PARTICIPATES IN BIOLOGICAL PROCESS\", \"GENE IN PATHWAY\", \"GENE INTERACTS WITH GENE\", \"GENE HAS MOLECULAR FUNCTION\", \"GENE ASSOCIATED WITH CELLULAR COMPONENT\", \"GENE ASSOCIATES WITH DISEASE\", \"BODYPART OVER EXPRESSES GENE\", \"BODYPART UNDEREXPRESSES GENE\", \"SYMPTOM MANIFESTATION OF DISEASE\", \"DISEASE LOCALIZES TO ANATOMY\", \"DISEASE ASSOCIATES WITH DISEASE\".\nFrom the query, split it into multiple instructions of simple single node to Relationship to node format that would answer the query. Start the instructions from specifics node names. The format of each <Node> tag would be Node Title-Relationship-Node Title. If there are any specific nodes and not a node type, put a ! before and after the word. For instance, Alzheimer's is a specific Disease node, so it should be labeled \"!Alzheimer's Disease!\". Another example are of gene symbols, which are specific genes, so they should be labeled \"!APOE!\".\n<Example> \n<Query>List the drugs that can treat Alzheimer's Disease</Query>\n<Instructions>\n<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>Provide a list of all genes associated with Alzheimer's Disease</Query>\n<Instructions>\n<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>Which classes of drugs can be used to treat Alzheimer's disease?</Query>\n<Instructions>\n<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>\n<Node>DrugClass-DRUGINCLASS-Drug</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>List ncRNA type genes that are associated with Alzheimer's Disease</Query>\n<Instructions>\n<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>\n<Node>Gene-GeneType-!ncRNA!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>List the body parts overexpressing the gene ACE</Query>\n<Instructions>\n<Node>BodyPart-BODYPART OVEREXPRESSES GENE-!ACE!</Node>\n</Instructions>\n</Example>\n\n<Query>List the body parts/anatomy which over-express both the genes METTL5 and STYXL2</Query\n"
        }
      ]
    },
    {
      "key": "node_0",
      "label": "Generate",
      "tag": "Generate",
      "URL": "",
      "cluster": "1",
      "x": 0,
      "y": 40,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "",
          "phase": 1,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "You are an AI prompt simplifier with access to a knowledge graph of Alzheimer's disease. You will receive a query related to simplifying the query into parts that can be separated by relationship between nodes.\nThe knowledge graph contains node types: Gene, DrugClass, Drug, Disease, Pathway, BiologicalProcess, MolecularFunction, CellularComponent, Symptom, BodyPart. \nGene nodes have gene type as a property.\nThe knowledge graph contains relationships: \"CHEMICAL BINDS GENE\",\"CHEMICAL INCREASES EXPRESSION\", \"CHEMICAL DECREASES EXPRESSION\", \"DRUG IN CLASS\", \"DRUG TREATS DISEASE\", \"DRUG CAUSES EFFECT\", \"GENE PARTICIPATES IN BIOLOGICAL PROCESS\", \"GENE IN PATHWAY\", \"GENE INTERACTS WITH GENE\", \"GENE HAS MOLECULAR FUNCTION\", \"GENE ASSOCIATED WITH CELLULAR COMPONENT\", \"GENE ASSOCIATES WITH DISEASE\", \"BODYPART OVER EXPRESSES GENE\", \"BODYPART UNDEREXPRESSES GENE\", \"SYMPTOM MANIFESTATION OF DISEASE\", \"DISEASE LOCALIZES TO ANATOMY\", \"DISEASE ASSOCIATES WITH DISEASE\".\nFrom the query, split it into multiple instructions of simple single node to Relationship to node format that would answer the query. Start the instructions from specifics node names. The format of each <Node> tag would be Node Title-Relationship-Node Title. If there are any specific nodes and not a node type, put a ! before and after the word. For instance, Alzheimer's is a specific Disease node, so it should be labeled \"!Alzheimer's Disease!\". Another example are of gene symbols, which are specific genes, so they should be labeled \"!APOE!\".\n<Example> \n<Query>List the drugs that can treat Alzheimer's Disease</Query>\n<Instructions>\n<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>Provide a list of all genes associated with Alzheimer's Disease</Query>\n<Instructions>\n<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>Which classes of drugs can be used to treat Alzheimer's disease?</Query>\n<Instructions>\n<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>\n<Node>DrugClass-DRUGINCLASS-Drug</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>List ncRNA type genes that are associated with Alzheimer's Disease</Query>\n<Instructions>\n<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>\n<Node>Gene-GeneType-!ncRNA!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>List the body parts overexpressing the gene ACE</Query>\n<Instructions>\n<Node>BodyPart-BODYPART OVEREXPRESSES GENE-!ACE!</Node>\n</Instructions>\n</Example>\n\n<Query>List the body parts/anatomy which over-express both the genes METTL5 and STYXL2</Query\n"
        }
      ]
    },
    {
      "key": "node_1",
      "label": "Selector",
      "tag": "Selector",
      "URL": "",
      "cluster": "2",
      "x": -13,
      "y": 30,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "",
          "phase": 1,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "You are an AI prompt simplifier with access to a knowledge graph of Alzheimer's disease. You will receive a query related to simplifying the query into parts that can be separated by relationship between nodes.\nThe knowledge graph contains node types: Gene, DrugClass, Drug, Disease, Pathway, BiologicalProcess, MolecularFunction, CellularComponent, Symptom, BodyPart. \nGene nodes have gene type as a property.\nThe knowledge graph contains relationships: \"CHEMICAL BINDS GENE\",\"CHEMICAL INCREASES EXPRESSION\", \"CHEMICAL DECREASES EXPRESSION\", \"DRUG IN CLASS\", \"DRUG TREATS DISEASE\", \"DRUG CAUSES EFFECT\", \"GENE PARTICIPATES IN BIOLOGICAL PROCESS\", \"GENE IN PATHWAY\", \"GENE INTERACTS WITH GENE\", \"GENE HAS MOLECULAR FUNCTION\", \"GENE ASSOCIATED WITH CELLULAR COMPONENT\", \"GENE ASSOCIATES WITH DISEASE\", \"BODYPART OVER EXPRESSES GENE\", \"BODYPART UNDEREXPRESSES GENE\", \"SYMPTOM MANIFESTATION OF DISEASE\", \"DISEASE LOCALIZES TO ANATOMY\", \"DISEASE ASSOCIATES WITH DISEASE\".\nFrom the query, split it into multiple instructions of simple single node to Relationship to node format that would answer the query. Start the instructions from specifics node names. The format of each <Node> tag would be Node Title-Relationship-Node Title. If there are any specific nodes and not a node type, put a ! before and after the word. For instance, Alzheimer's is a specific Disease node, so it should be labeled \"!Alzheimer's Disease!\". Another example are of gene symbols, which are specific genes, so they should be labeled \"!APOE!\".\n<Example> \n<Query>List the drugs that can treat Alzheimer's Disease</Query>\n<Instructions>\n<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>Provide a list of all genes associated with Alzheimer's Disease</Query>\n<Instructions>\n<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>Which classes of drugs can be used to treat Alzheimer's disease?</Query>\n<Instructions>\n<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>\n<Node>DrugClass-DRUGINCLASS-Drug</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>List ncRNA type genes that are associated with Alzheimer's Disease</Query>\n<Instructions>\n<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>\n<Node>Gene-GeneType-!ncRNA!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>List the body parts overexpressing the gene ACE</Query>\n<Instructions>\n<Node>BodyPart-BODYPART OVEREXPRESSES GENE-!ACE!</Node>\n</Instructions>\n</Example>\n\n<Query>List the body parts/anatomy which over-express both the genes METTL5 and STYXL2</Query\n",
          "edge_id": 0,
          "total_edges": 2
        }
      ]
    },
    {
      "key": "node_2",
      "label": "Generate",
      "tag": "Generate",
      "URL": "",
      "cluster": "1",
      "x": -13,
      "y": 20,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "The gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.",
          "phase": 1,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "<Instruction> You are an AI knowledge simplifier with access to a knowledge graph. Your task is to filter out irrelevant information from a given set of knowledge and provide a concise summary. You will receive a statement describing a relationship and a list of knowledge. Only include knowledge directly related to the statement, disregarding any extraneous details. Present the condensed summarized knowledge within the <Output> tags.\n</Instruction>\n<Statement>\nBodyPart-BODYPART OVEREXPRESSES GENE-METTL5\n</Statement>\n<Knowledge>\nThe gene METTL5 is associated with the blood because the body part under-expresses the gene\nThe gene UBC is associated with the gene METTL5 because the gene interacts with the gene\nGene METTL5P2 is a pseudo gene for METTL5 pseudogene 2\nThe gene METTL5 is associated with the gene UBC because the gene interacts with the gene\nGene METTL5P3 is a pseudo gene for METTL5 pseudogene 3\nGene METTL5P1 is a pseudo gene for METTL5 pseudogene 1\nGene METTL5P4 is a pseudo gene for METTL5 pseudogene 4\nThe gene METTL5 is involved in the molecular function methyltransferase activity\nThe gene METTL5 is involved in the biological process methylation because the gene participates in the biological process\nGene METTL5 is a protein-coding gene for methyltransferase 5, N6-adenosine\nThe gene METTL5 is associated with the midbrain because the body part over-expresses the gene\nThe gene METTL5 is associated with the lung because the body part under-expresses the gene\nThe gene METTL5 is associated with the urethra because the body part over-expresses the gene\nThe gene METTL5 is associated with the heart because the body part over-expresses the gene\nThe gene METTL5 is associated with the nipple because the body part under-expresses the gene\nThe gene METTL5 is associated with the drug Everolimus because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the drug Digitoxin because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the drug Ouabain because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the drug Bisacodyl because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the adrenal gland because the body part under-expresses the gene\nThe gene METTL5 is associated with the adipose tissue because the body part over-expresses the gene\nThe gene METTL5 is associated with the smooth muscle tissue because the body part over-expresses the gene\nThe gene METTL5 is involved in the molecular function transferase activity, transferring one-carbon groups\nThe gene METTL5 is associated with the saliva-secreting gland because the body part over-expresses the gene\nThe gene METTL25 is associated with the blood because the body part over-expresses the gene\n</Knowledge>\n",
          "edge_id": 0,
          "total_edges": 2,
          "knowledge": "\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5."
        }
      ]
    },
    {
      "key": "node_3",
      "label": "Selector",
      "tag": "Selector",
      "URL": "",
      "cluster": "2",
      "x": 13,
      "y": 30,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "The gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.",
          "phase": 1,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "<Instruction> You are an AI knowledge simplifier with access to a knowledge graph. Your task is to filter out irrelevant information from a given set of knowledge and provide a concise summary. You will receive a statement describing a relationship and a list of knowledge. Only include knowledge directly related to the statement, disregarding any extraneous details. Present the condensed summarized knowledge within the <Output> tags.\n</Instruction>\n<Statement>\nBodyPart-BODYPART OVEREXPRESSES GENE-METTL5\n</Statement>\n<Knowledge>\nThe gene METTL5 is associated with the blood because the body part under-expresses the gene\nThe gene UBC is associated with the gene METTL5 because the gene interacts with the gene\nGene METTL5P2 is a pseudo gene for METTL5 pseudogene 2\nThe gene METTL5 is associated with the gene UBC because the gene interacts with the gene\nGene METTL5P3 is a pseudo gene for METTL5 pseudogene 3\nGene METTL5P1 is a pseudo gene for METTL5 pseudogene 1\nGene METTL5P4 is a pseudo gene for METTL5 pseudogene 4\nThe gene METTL5 is involved in the molecular function methyltransferase activity\nThe gene METTL5 is involved in the biological process methylation because the gene participates in the biological process\nGene METTL5 is a protein-coding gene for methyltransferase 5, N6-adenosine\nThe gene METTL5 is associated with the midbrain because the body part over-expresses the gene\nThe gene METTL5 is associated with the lung because the body part under-expresses the gene\nThe gene METTL5 is associated with the urethra because the body part over-expresses the gene\nThe gene METTL5 is associated with the heart because the body part over-expresses the gene\nThe gene METTL5 is associated with the nipple because the body part under-expresses the gene\nThe gene METTL5 is associated with the drug Everolimus because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the drug Digitoxin because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the drug Ouabain because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the drug Bisacodyl because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the adrenal gland because the body part under-expresses the gene\nThe gene METTL5 is associated with the adipose tissue because the body part over-expresses the gene\nThe gene METTL5 is associated with the smooth muscle tissue because the body part over-expresses the gene\nThe gene METTL5 is involved in the molecular function transferase activity, transferring one-carbon groups\nThe gene METTL5 is associated with the saliva-secreting gland because the body part over-expresses the gene\nThe gene METTL25 is associated with the blood because the body part over-expresses the gene\n</Knowledge>\n",
          "edge_id": 1,
          "total_edges": 2,
          "knowledge": "\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5."
        }
      ]
    },

    {
      "key": "node_4",
      "label": "Generate",
      "tag": "Generate",
      "URL": "",
      "cluster": "1",
      "x": 13,
      "y": 20,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "The gene STYXL2 is involved in the molecular function phosphatase activity.\nThe gene STYXL2 is involved in the biological process dephosphorylation.\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity.\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene.",
          "phase": 2,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "<Instruction> You are an AI knowledge simplifier with access to a knowledge graph. Your task is to filter out irrelevant information from a given set of knowledge and provide a concise summary. You will receive a statement describing a relationship and a list of knowledge. Only include knowledge directly related to the statement, disregarding any extraneous details. Present the condensed summarized knowledge within the <Output> tags.\n</Instruction>\n<Statement>\nBodyPart-BODYPART OVEREXPRESSES GENE-STYXL2\n</Statement>\n<Knowledge>\nThe gene STYXL2 is involved in the molecular function phosphatase activity\nThe gene STYXL2 is involved in the biological process dephosphorylation because the gene participates in the biological process\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity\nThe gene STYXL2 is associated with the midbrain because the body part under-expresses the gene\nThe gene STYXL2 is involved in the biological process protein dephosphorylation because the gene participates in the biological process\nThe gene STYXL2 is associated with the liver because the body part under-expresses the gene\nThe gene STYXL2 is involved in the molecular function phosphoric ester hydrolase activity\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene\nThe gene STYXL2 is associated with the cerebellum because the body part under-expresses the gene\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene\nThe gene STYXL2 is associated with the trigeminal ganglion because the body part under-expresses the gene\nThe gene STYXL2 is associated with the spinal cord because the body part under-expresses the gene\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene\nThe gene STYXL2 is associated with the medulla oblongata because the body part under-expresses the gene\nGene STYXL2 is a protein-coding gene for serine/threonine/tyrosine interacting like 2\nThe gene STYXL2 is associated with the adrenal gland because the body part under-expresses the gene\nThe gene STYXL2 is involved in the molecular function hydrolase activity, acting on ester bonds\nThe gene STYXL2 is involved in the molecular function protein tyrosine/serine/threonine phosphatase activity\nThe gene STYXL1 is associated with the blood because the body part over-expresses the gene\nThe gene EXTL2 is associated with the bone marrow because the body part under-expresses the gene\nThe gene EXTL2 is associated with the blood because the body part under-expresses the gene\nThe gene BEX2 is associated with the blood because the body part over-expresses the gene\nThe gene RBMXL1 is associated with the blood because the body part over-expresses the gene\nThe gene SCYL2 is associated with the bone marrow because the body part over-expresses the gene\nThe gene EXOSC2 is associated with the blood because the body part over-expresses the gene\n</Knowledge>\n",
          "edge_id": 1,
          "total_edges": 2,
          "knowledge": "\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.\nThe gene STYXL2 is involved in the molecular function phosphatase activity.\nThe gene STYXL2 is involved in the biological process dephosphorylation.\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity.\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene."
        }
      ]
    },
    {
      "key": "node_5",
      "label": "Generate",
      "tag": "Generate",
      "URL": "",
      "cluster": "1",
      "x": 0,
      "y": 10,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "heart\nadrenal gland",
          "phase": 3,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "<Instruction> You are an Alzheimer's data specialist AI assistant dedicated to providing information and support related to Alzheimer's disease.\nYour primary goal is to assist users by offering factual and relevant information based on your access to a comprehensive knowledge graph associated with Alzheimer's. \nYour responses are focused on addressing queries related to Alzheimer's, and you do not provide information unrelated to the topic. \nYou will also only answer based on the knowledge within the knowledge graph within the <Knowledge> tags. \nYou will notice there will be gene symbols in the knowledge, and there are subtle differences between the gene names.\nYou will need to be careful that the names are exact with you use them in context. There may be single differences in numbers and letters.\nFor example, the gene \"APOE\" is not the same as gene \"APOE1\". Another example is the gene \"IQCK\" is not the same as gene \"IQCG\".\nYou will need to be careful of specific biological terms. For example, the term \"amino\" is different from the term \"amine\".\nIf you are providing a list, be sure not to list duplicates. \nYour demeanor is empathetic and concise as you aim to help users understand and navigate Alzheimer's-related concerns.\nYou will be provided knowledge within the <Knowledge> tags and must answer the question in the <Question> tags.\nYour response should be within the <Output> tags.\nYou will be asked to answer the question with only the list with each element separated by a newline.\n</Instruction> \n<Knowledge>\n\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.\nThe gene STYXL2 is involved in the molecular function phosphatase activity.\nThe gene STYXL2 is involved in the biological process dephosphorylation.\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity.\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene.\n</Knowledge>\n<Question>List the body parts/anatomy which over-express both the genes METTL5 and STYXL2</Question>\n\n<Approach>\nTo answer the question, follow these steps:\n1. Identify the relevant nodes in the knowledge graph.\n2. Identify the relevant relationships between the nodes.\n3. Generate a response based on the identified nodes and relationships.\n</Approach>\n\n<Examples>\n<Question>True or False Question: AP2M1 is not subject to decreased expression by the drug Botulinum toxin type A</Question>\n<Reasoning>The knowledge graph contains the node AP2M1 and the node Botulinum toxin type A. The knowledge provided contains no link from AP2M1 to Botulinum toxin type A. Therefore, the answer is TRUE.</Reasoning>\n<Output>True</Output>\n\n<Question>Which of the following genes is not under-expressed in testis? 1. FLT1 2. TLE2 3. PDS5A 4. CSF1 5. MGST1</Question>\n<Reasoning>In the knowledge graph, we detect that FLT1, TLE2, CSF1, MGST1 are associated with testis because the body part under-expresses the gene. We also detect that PDS5A is associated with testis because the body part over-expresses the gene. Therefore, the answer is PDS5A.</Reasoning>\n<Output>3. PDS5A</Output>\n</Examples>\n",
          "edge_id": 1,
          "total_edges": 2,
          "knowledge": "\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.\nThe gene STYXL2 is involved in the molecular function phosphatase activity.\nThe gene STYXL2 is involved in the biological process dephosphorylation.\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity.\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene."
        }
      ]
    },

    {
      "key": "node_6",
      "label": "Answer",
      "tag": "Answer",
      "URL": "",
      "cluster": "3",
      "x": 0,
      "y": 0,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "heart\nadrenal gland",
          "phase": 3,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "<Instruction> You are an Alzheimer's data specialist AI assistant dedicated to providing information and support related to Alzheimer's disease.\nYour primary goal is to assist users by offering factual and relevant information based on your access to a comprehensive knowledge graph associated with Alzheimer's. \nYour responses are focused on addressing queries related to Alzheimer's, and you do not provide information unrelated to the topic. \nYou will also only answer based on the knowledge within the knowledge graph within the <Knowledge> tags. \nYou will notice there will be gene symbols in the knowledge, and there are subtle differences between the gene names.\nYou will need to be careful that the names are exact with you use them in context. There may be single differences in numbers and letters.\nFor example, the gene \"APOE\" is not the same as gene \"APOE1\". Another example is the gene \"IQCK\" is not the same as gene \"IQCG\".\nYou will need to be careful of specific biological terms. For example, the term \"amino\" is different from the term \"amine\".\nIf you are providing a list, be sure not to list duplicates. \nYour demeanor is empathetic and concise as you aim to help users understand and navigate Alzheimer's-related concerns.\nYou will be provided knowledge within the <Knowledge> tags and must answer the question in the <Question> tags.\nYour response should be within the <Output> tags.\nYou will be asked to answer the question with only the list with each element separated by a newline.\n</Instruction> \n<Knowledge>\n\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.\nThe gene STYXL2 is involved in the molecular function phosphatase activity.\nThe gene STYXL2 is involved in the biological process dephosphorylation.\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity.\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene.\n</Knowledge>\n<Question>List the body parts/anatomy which over-express both the genes METTL5 and STYXL2</Question>\n\n<Approach>\nTo answer the question, follow these steps:\n1. Identify the relevant nodes in the knowledge graph.\n2. Identify the relevant relationships between the nodes.\n3. Generate a response based on the identified nodes and relationships.\n</Approach>\n\n<Examples>\n<Question>True or False Question: AP2M1 is not subject to decreased expression by the drug Botulinum toxin type A</Question>\n<Reasoning>The knowledge graph contains the node AP2M1 and the node Botulinum toxin type A. The knowledge provided contains no link from AP2M1 to Botulinum toxin type A. Therefore, the answer is TRUE.</Reasoning>\n<Output>True</Output>\n\n<Question>Which of the following genes is not under-expressed in testis? 1. FLT1 2. TLE2 3. PDS5A 4. CSF1 5. MGST1</Question>\n<Reasoning>In the knowledge graph, we detect that FLT1, TLE2, CSF1, MGST1 are associated with testis because the body part under-expresses the gene. We also detect that PDS5A is associated with testis because the body part over-expresses the gene. Therefore, the answer is PDS5A.</Reasoning>\n<Output>3. PDS5A</Output>\n</Examples>\n",
          "edge_id": 1,
          "total_edges": 2,
          "knowledge": "\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.\nThe gene STYXL2 is involved in the molecular function phosphatase activity.\nThe gene STYXL2 is involved in the biological process dephosphorylation.\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity.\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene."
        }
      ]
    }
  ],
  "edges": [
    ["node_-1", "node_0", ""],
    ["node_0", "node_1", "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!"],
    ["node_0", "node_3", "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"],
    ["node_1", "node_2", "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!"],
    ["node_3", "node_4", "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"],
    ["node_2", "node_5", "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!"],
    ["node_4", "node_5", "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"],
    ["node_5", "node_6", ""]
  ],
  "clusters": [
    { "key": "0", "color": "#00ffbc", "clusterLabel": "Question" },
    { "key": "1", "color": "#ff004f", "clusterLabel": "Generate" },
    { "key": "2", "color": "#23a6d5", "clusterLabel": "Selector" },
    { "key": "3", "color": "#f9a11b", "clusterLabel": "Answer" }
  ],
  "tags": [
    { "key": "Question", "image": "question.svg" },
    { "key": "Generate", "image": "generator.svg" },
    { "key": "Selector", "image": "selector.svg" },
    { "key": "Answer", "image": "answer.svg" }
  ]
}

    return jsonify(result), 200


# receive chatInput from frontend
@bp.route('/userchatinput', methods=['POST'])
@cross_origin()
def receive_chat_input():
    try:
        req_data = request.get_json()
        chat_input = req_data.get('chatInput')
        print("Received chatInput:", chat_input)
        
        # Perform the desired operation here.
        
        return jsonify({'message': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500




# get test json
@bp.route('/gotjson', methods=['GET'])
@cross_origin()
def got_test_return_json():
    
    result = {
  "nodes": [
    {
      "key": "node_-1",
      "label": "Question",
      "tag": "Question",
      "URL": "",
      "cluster": "0",
      "x": 0,
      "y": 45,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "",
          "phase": 1,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "You are an AI prompt simplifier with access to a knowledge graph of Alzheimer's disease. You will receive a query related to simplifying the query into parts that can be separated by relationship between nodes.\nThe knowledge graph contains node types: Gene, DrugClass, Drug, Disease, Pathway, BiologicalProcess, MolecularFunction, CellularComponent, Symptom, BodyPart. \nGene nodes have gene type as a property.\nThe knowledge graph contains relationships: \"CHEMICAL BINDS GENE\",\"CHEMICAL INCREASES EXPRESSION\", \"CHEMICAL DECREASES EXPRESSION\", \"DRUG IN CLASS\", \"DRUG TREATS DISEASE\", \"DRUG CAUSES EFFECT\", \"GENE PARTICIPATES IN BIOLOGICAL PROCESS\", \"GENE IN PATHWAY\", \"GENE INTERACTS WITH GENE\", \"GENE HAS MOLECULAR FUNCTION\", \"GENE ASSOCIATED WITH CELLULAR COMPONENT\", \"GENE ASSOCIATES WITH DISEASE\", \"BODYPART OVER EXPRESSES GENE\", \"BODYPART UNDEREXPRESSES GENE\", \"SYMPTOM MANIFESTATION OF DISEASE\", \"DISEASE LOCALIZES TO ANATOMY\", \"DISEASE ASSOCIATES WITH DISEASE\".\nFrom the query, split it into multiple instructions of simple single node to Relationship to node format that would answer the query. Start the instructions from specifics node names. The format of each <Node> tag would be Node Title-Relationship-Node Title. If there are any specific nodes and not a node type, put a ! before and after the word. For instance, Alzheimer's is a specific Disease node, so it should be labeled \"!Alzheimer's Disease!\". Another example are of gene symbols, which are specific genes, so they should be labeled \"!APOE!\".\n<Example> \n<Query>List the drugs that can treat Alzheimer's Disease</Query>\n<Instructions>\n<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>Provide a list of all genes associated with Alzheimer's Disease</Query>\n<Instructions>\n<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>Which classes of drugs can be used to treat Alzheimer's disease?</Query>\n<Instructions>\n<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>\n<Node>DrugClass-DRUGINCLASS-Drug</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>List ncRNA type genes that are associated with Alzheimer's Disease</Query>\n<Instructions>\n<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>\n<Node>Gene-GeneType-!ncRNA!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>List the body parts overexpressing the gene ACE</Query>\n<Instructions>\n<Node>BodyPart-BODYPART OVEREXPRESSES GENE-!ACE!</Node>\n</Instructions>\n</Example>\n\n<Query>List the body parts/anatomy which over-express both the genes METTL5 and STYXL2</Query\n"
        }
      ]
    },
    {
      "key": "node_0",
      "label": "Generate",
      "tag": "Generate",
      "URL": "",
      "cluster": "1",
      "x": 0,
      "y": 40,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "",
          "phase": 1,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "You are an AI prompt simplifier with access to a knowledge graph of Alzheimer's disease. You will receive a query related to simplifying the query into parts that can be separated by relationship between nodes.\nThe knowledge graph contains node types: Gene, DrugClass, Drug, Disease, Pathway, BiologicalProcess, MolecularFunction, CellularComponent, Symptom, BodyPart. \nGene nodes have gene type as a property.\nThe knowledge graph contains relationships: \"CHEMICAL BINDS GENE\",\"CHEMICAL INCREASES EXPRESSION\", \"CHEMICAL DECREASES EXPRESSION\", \"DRUG IN CLASS\", \"DRUG TREATS DISEASE\", \"DRUG CAUSES EFFECT\", \"GENE PARTICIPATES IN BIOLOGICAL PROCESS\", \"GENE IN PATHWAY\", \"GENE INTERACTS WITH GENE\", \"GENE HAS MOLECULAR FUNCTION\", \"GENE ASSOCIATED WITH CELLULAR COMPONENT\", \"GENE ASSOCIATES WITH DISEASE\", \"BODYPART OVER EXPRESSES GENE\", \"BODYPART UNDEREXPRESSES GENE\", \"SYMPTOM MANIFESTATION OF DISEASE\", \"DISEASE LOCALIZES TO ANATOMY\", \"DISEASE ASSOCIATES WITH DISEASE\".\nFrom the query, split it into multiple instructions of simple single node to Relationship to node format that would answer the query. Start the instructions from specifics node names. The format of each <Node> tag would be Node Title-Relationship-Node Title. If there are any specific nodes and not a node type, put a ! before and after the word. For instance, Alzheimer's is a specific Disease node, so it should be labeled \"!Alzheimer's Disease!\". Another example are of gene symbols, which are specific genes, so they should be labeled \"!APOE!\".\n<Example> \n<Query>List the drugs that can treat Alzheimer's Disease</Query>\n<Instructions>\n<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>Provide a list of all genes associated with Alzheimer's Disease</Query>\n<Instructions>\n<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>Which classes of drugs can be used to treat Alzheimer's disease?</Query>\n<Instructions>\n<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>\n<Node>DrugClass-DRUGINCLASS-Drug</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>List ncRNA type genes that are associated with Alzheimer's Disease</Query>\n<Instructions>\n<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>\n<Node>Gene-GeneType-!ncRNA!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>List the body parts overexpressing the gene ACE</Query>\n<Instructions>\n<Node>BodyPart-BODYPART OVEREXPRESSES GENE-!ACE!</Node>\n</Instructions>\n</Example>\n\n<Query>List the body parts/anatomy which over-express both the genes METTL5 and STYXL2</Query\n"
        }
      ]
    },
    {
      "key": "node_1",
      "label": "Selector",
      "tag": "Selector",
      "URL": "",
      "cluster": "2",
      "x": -13,
      "y": 30,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "",
          "phase": 1,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "You are an AI prompt simplifier with access to a knowledge graph of Alzheimer's disease. You will receive a query related to simplifying the query into parts that can be separated by relationship between nodes.\nThe knowledge graph contains node types: Gene, DrugClass, Drug, Disease, Pathway, BiologicalProcess, MolecularFunction, CellularComponent, Symptom, BodyPart. \nGene nodes have gene type as a property.\nThe knowledge graph contains relationships: \"CHEMICAL BINDS GENE\",\"CHEMICAL INCREASES EXPRESSION\", \"CHEMICAL DECREASES EXPRESSION\", \"DRUG IN CLASS\", \"DRUG TREATS DISEASE\", \"DRUG CAUSES EFFECT\", \"GENE PARTICIPATES IN BIOLOGICAL PROCESS\", \"GENE IN PATHWAY\", \"GENE INTERACTS WITH GENE\", \"GENE HAS MOLECULAR FUNCTION\", \"GENE ASSOCIATED WITH CELLULAR COMPONENT\", \"GENE ASSOCIATES WITH DISEASE\", \"BODYPART OVER EXPRESSES GENE\", \"BODYPART UNDEREXPRESSES GENE\", \"SYMPTOM MANIFESTATION OF DISEASE\", \"DISEASE LOCALIZES TO ANATOMY\", \"DISEASE ASSOCIATES WITH DISEASE\".\nFrom the query, split it into multiple instructions of simple single node to Relationship to node format that would answer the query. Start the instructions from specifics node names. The format of each <Node> tag would be Node Title-Relationship-Node Title. If there are any specific nodes and not a node type, put a ! before and after the word. For instance, Alzheimer's is a specific Disease node, so it should be labeled \"!Alzheimer's Disease!\". Another example are of gene symbols, which are specific genes, so they should be labeled \"!APOE!\".\n<Example> \n<Query>List the drugs that can treat Alzheimer's Disease</Query>\n<Instructions>\n<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>Provide a list of all genes associated with Alzheimer's Disease</Query>\n<Instructions>\n<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>Which classes of drugs can be used to treat Alzheimer's disease?</Query>\n<Instructions>\n<Node>Drug-DRUG TREATS DISEASE-!Alzheimer's Disease!</Node>\n<Node>DrugClass-DRUGINCLASS-Drug</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>List ncRNA type genes that are associated with Alzheimer's Disease</Query>\n<Instructions>\n<Node>Gene-GENE ASSOCIATES WITH DISEASE-!Alzheimer's Disease!</Node>\n<Node>Gene-GeneType-!ncRNA!</Node>\n</Instructions>\n</Example>\n\n<Example>\n<Query>List the body parts overexpressing the gene ACE</Query>\n<Instructions>\n<Node>BodyPart-BODYPART OVEREXPRESSES GENE-!ACE!</Node>\n</Instructions>\n</Example>\n\n<Query>List the body parts/anatomy which over-express both the genes METTL5 and STYXL2</Query\n",
          "edge_id": 0,
          "total_edges": 2
        }
      ]
    },
    {
      "key": "node_2",
      "label": "Generate",
      "tag": "Generate",
      "URL": "",
      "cluster": "1",
      "x": -13,
      "y": 20,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "The gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.",
          "phase": 1,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "<Instruction> You are an AI knowledge simplifier with access to a knowledge graph. Your task is to filter out irrelevant information from a given set of knowledge and provide a concise summary. You will receive a statement describing a relationship and a list of knowledge. Only include knowledge directly related to the statement, disregarding any extraneous details. Present the condensed summarized knowledge within the <Output> tags.\n</Instruction>\n<Statement>\nBodyPart-BODYPART OVEREXPRESSES GENE-METTL5\n</Statement>\n<Knowledge>\nThe gene METTL5 is associated with the blood because the body part under-expresses the gene\nThe gene UBC is associated with the gene METTL5 because the gene interacts with the gene\nGene METTL5P2 is a pseudo gene for METTL5 pseudogene 2\nThe gene METTL5 is associated with the gene UBC because the gene interacts with the gene\nGene METTL5P3 is a pseudo gene for METTL5 pseudogene 3\nGene METTL5P1 is a pseudo gene for METTL5 pseudogene 1\nGene METTL5P4 is a pseudo gene for METTL5 pseudogene 4\nThe gene METTL5 is involved in the molecular function methyltransferase activity\nThe gene METTL5 is involved in the biological process methylation because the gene participates in the biological process\nGene METTL5 is a protein-coding gene for methyltransferase 5, N6-adenosine\nThe gene METTL5 is associated with the midbrain because the body part over-expresses the gene\nThe gene METTL5 is associated with the lung because the body part under-expresses the gene\nThe gene METTL5 is associated with the urethra because the body part over-expresses the gene\nThe gene METTL5 is associated with the heart because the body part over-expresses the gene\nThe gene METTL5 is associated with the nipple because the body part under-expresses the gene\nThe gene METTL5 is associated with the drug Everolimus because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the drug Digitoxin because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the drug Ouabain because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the drug Bisacodyl because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the adrenal gland because the body part under-expresses the gene\nThe gene METTL5 is associated with the adipose tissue because the body part over-expresses the gene\nThe gene METTL5 is associated with the smooth muscle tissue because the body part over-expresses the gene\nThe gene METTL5 is involved in the molecular function transferase activity, transferring one-carbon groups\nThe gene METTL5 is associated with the saliva-secreting gland because the body part over-expresses the gene\nThe gene METTL25 is associated with the blood because the body part over-expresses the gene\n</Knowledge>\n",
          "edge_id": 0,
          "total_edges": 2,
          "knowledge": "\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5."
        }
      ]
    },
    {
      "key": "node_3",
      "label": "Selector",
      "tag": "Selector",
      "URL": "",
      "cluster": "2",
      "x": 13,
      "y": 30,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "The gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.",
          "phase": 1,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "<Instruction> You are an AI knowledge simplifier with access to a knowledge graph. Your task is to filter out irrelevant information from a given set of knowledge and provide a concise summary. You will receive a statement describing a relationship and a list of knowledge. Only include knowledge directly related to the statement, disregarding any extraneous details. Present the condensed summarized knowledge within the <Output> tags.\n</Instruction>\n<Statement>\nBodyPart-BODYPART OVEREXPRESSES GENE-METTL5\n</Statement>\n<Knowledge>\nThe gene METTL5 is associated with the blood because the body part under-expresses the gene\nThe gene UBC is associated with the gene METTL5 because the gene interacts with the gene\nGene METTL5P2 is a pseudo gene for METTL5 pseudogene 2\nThe gene METTL5 is associated with the gene UBC because the gene interacts with the gene\nGene METTL5P3 is a pseudo gene for METTL5 pseudogene 3\nGene METTL5P1 is a pseudo gene for METTL5 pseudogene 1\nGene METTL5P4 is a pseudo gene for METTL5 pseudogene 4\nThe gene METTL5 is involved in the molecular function methyltransferase activity\nThe gene METTL5 is involved in the biological process methylation because the gene participates in the biological process\nGene METTL5 is a protein-coding gene for methyltransferase 5, N6-adenosine\nThe gene METTL5 is associated with the midbrain because the body part over-expresses the gene\nThe gene METTL5 is associated with the lung because the body part under-expresses the gene\nThe gene METTL5 is associated with the urethra because the body part over-expresses the gene\nThe gene METTL5 is associated with the heart because the body part over-expresses the gene\nThe gene METTL5 is associated with the nipple because the body part under-expresses the gene\nThe gene METTL5 is associated with the drug Everolimus because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the drug Digitoxin because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the drug Ouabain because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the drug Bisacodyl because the chemical or drug decreases the gene expression\nThe gene METTL5 is associated with the adrenal gland because the body part under-expresses the gene\nThe gene METTL5 is associated with the adipose tissue because the body part over-expresses the gene\nThe gene METTL5 is associated with the smooth muscle tissue because the body part over-expresses the gene\nThe gene METTL5 is involved in the molecular function transferase activity, transferring one-carbon groups\nThe gene METTL5 is associated with the saliva-secreting gland because the body part over-expresses the gene\nThe gene METTL25 is associated with the blood because the body part over-expresses the gene\n</Knowledge>\n",
          "edge_id": 1,
          "total_edges": 2,
          "knowledge": "\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5."
        }
      ]
    },

    {
      "key": "node_4",
      "label": "Generate",
      "tag": "Generate",
      "URL": "",
      "cluster": "1",
      "x": 13,
      "y": 20,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "The gene STYXL2 is involved in the molecular function phosphatase activity.\nThe gene STYXL2 is involved in the biological process dephosphorylation.\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity.\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene.",
          "phase": 2,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "<Instruction> You are an AI knowledge simplifier with access to a knowledge graph. Your task is to filter out irrelevant information from a given set of knowledge and provide a concise summary. You will receive a statement describing a relationship and a list of knowledge. Only include knowledge directly related to the statement, disregarding any extraneous details. Present the condensed summarized knowledge within the <Output> tags.\n</Instruction>\n<Statement>\nBodyPart-BODYPART OVEREXPRESSES GENE-STYXL2\n</Statement>\n<Knowledge>\nThe gene STYXL2 is involved in the molecular function phosphatase activity\nThe gene STYXL2 is involved in the biological process dephosphorylation because the gene participates in the biological process\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity\nThe gene STYXL2 is associated with the midbrain because the body part under-expresses the gene\nThe gene STYXL2 is involved in the biological process protein dephosphorylation because the gene participates in the biological process\nThe gene STYXL2 is associated with the liver because the body part under-expresses the gene\nThe gene STYXL2 is involved in the molecular function phosphoric ester hydrolase activity\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene\nThe gene STYXL2 is associated with the cerebellum because the body part under-expresses the gene\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene\nThe gene STYXL2 is associated with the trigeminal ganglion because the body part under-expresses the gene\nThe gene STYXL2 is associated with the spinal cord because the body part under-expresses the gene\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene\nThe gene STYXL2 is associated with the medulla oblongata because the body part under-expresses the gene\nGene STYXL2 is a protein-coding gene for serine/threonine/tyrosine interacting like 2\nThe gene STYXL2 is associated with the adrenal gland because the body part under-expresses the gene\nThe gene STYXL2 is involved in the molecular function hydrolase activity, acting on ester bonds\nThe gene STYXL2 is involved in the molecular function protein tyrosine/serine/threonine phosphatase activity\nThe gene STYXL1 is associated with the blood because the body part over-expresses the gene\nThe gene EXTL2 is associated with the bone marrow because the body part under-expresses the gene\nThe gene EXTL2 is associated with the blood because the body part under-expresses the gene\nThe gene BEX2 is associated with the blood because the body part over-expresses the gene\nThe gene RBMXL1 is associated with the blood because the body part over-expresses the gene\nThe gene SCYL2 is associated with the bone marrow because the body part over-expresses the gene\nThe gene EXOSC2 is associated with the blood because the body part over-expresses the gene\n</Knowledge>\n",
          "edge_id": 1,
          "total_edges": 2,
          "knowledge": "\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.\nThe gene STYXL2 is involved in the molecular function phosphatase activity.\nThe gene STYXL2 is involved in the biological process dephosphorylation.\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity.\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene."
        }
      ]
    },
    {
      "key": "node_5",
      "label": "Generate",
      "tag": "Generate",
      "URL": "",
      "cluster": "1",
      "x": 0,
      "y": 10,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "heart\nadrenal gland",
          "phase": 3,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "<Instruction> You are an Alzheimer's data specialist AI assistant dedicated to providing information and support related to Alzheimer's disease.\nYour primary goal is to assist users by offering factual and relevant information based on your access to a comprehensive knowledge graph associated with Alzheimer's. \nYour responses are focused on addressing queries related to Alzheimer's, and you do not provide information unrelated to the topic. \nYou will also only answer based on the knowledge within the knowledge graph within the <Knowledge> tags. \nYou will notice there will be gene symbols in the knowledge, and there are subtle differences between the gene names.\nYou will need to be careful that the names are exact with you use them in context. There may be single differences in numbers and letters.\nFor example, the gene \"APOE\" is not the same as gene \"APOE1\". Another example is the gene \"IQCK\" is not the same as gene \"IQCG\".\nYou will need to be careful of specific biological terms. For example, the term \"amino\" is different from the term \"amine\".\nIf you are providing a list, be sure not to list duplicates. \nYour demeanor is empathetic and concise as you aim to help users understand and navigate Alzheimer's-related concerns.\nYou will be provided knowledge within the <Knowledge> tags and must answer the question in the <Question> tags.\nYour response should be within the <Output> tags.\nYou will be asked to answer the question with only the list with each element separated by a newline.\n</Instruction> \n<Knowledge>\n\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.\nThe gene STYXL2 is involved in the molecular function phosphatase activity.\nThe gene STYXL2 is involved in the biological process dephosphorylation.\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity.\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene.\n</Knowledge>\n<Question>List the body parts/anatomy which over-express both the genes METTL5 and STYXL2</Question>\n\n<Approach>\nTo answer the question, follow these steps:\n1. Identify the relevant nodes in the knowledge graph.\n2. Identify the relevant relationships between the nodes.\n3. Generate a response based on the identified nodes and relationships.\n</Approach>\n\n<Examples>\n<Question>True or False Question: AP2M1 is not subject to decreased expression by the drug Botulinum toxin type A</Question>\n<Reasoning>The knowledge graph contains the node AP2M1 and the node Botulinum toxin type A. The knowledge provided contains no link from AP2M1 to Botulinum toxin type A. Therefore, the answer is TRUE.</Reasoning>\n<Output>True</Output>\n\n<Question>Which of the following genes is not under-expressed in testis? 1. FLT1 2. TLE2 3. PDS5A 4. CSF1 5. MGST1</Question>\n<Reasoning>In the knowledge graph, we detect that FLT1, TLE2, CSF1, MGST1 are associated with testis because the body part under-expresses the gene. We also detect that PDS5A is associated with testis because the body part over-expresses the gene. Therefore, the answer is PDS5A.</Reasoning>\n<Output>3. PDS5A</Output>\n</Examples>\n",
          "edge_id": 1,
          "total_edges": 2,
          "knowledge": "\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.\nThe gene STYXL2 is involved in the molecular function phosphatase activity.\nThe gene STYXL2 is involved in the biological process dephosphorylation.\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity.\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene."
        }
      ]
    },

    {
      "key": "node_6",
      "label": "Answer",
      "tag": "Answer",
      "URL": "",
      "cluster": "3",
      "x": 0,
      "y": 0,
      "sizenode": 30,
      "thoughts": [
        {
          "question": "List the body parts/anatomy which over-express both the genes METTL5 and STYXL2",
          "ground_truth": "heart",
          "question_type": "list",
          "current": "heart\nadrenal gland",
          "phase": 3,
          "method": "got",
          "edges": [
            "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!",
            "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"
          ],
          "prompt": "<Instruction> You are an Alzheimer's data specialist AI assistant dedicated to providing information and support related to Alzheimer's disease.\nYour primary goal is to assist users by offering factual and relevant information based on your access to a comprehensive knowledge graph associated with Alzheimer's. \nYour responses are focused on addressing queries related to Alzheimer's, and you do not provide information unrelated to the topic. \nYou will also only answer based on the knowledge within the knowledge graph within the <Knowledge> tags. \nYou will notice there will be gene symbols in the knowledge, and there are subtle differences between the gene names.\nYou will need to be careful that the names are exact with you use them in context. There may be single differences in numbers and letters.\nFor example, the gene \"APOE\" is not the same as gene \"APOE1\". Another example is the gene \"IQCK\" is not the same as gene \"IQCG\".\nYou will need to be careful of specific biological terms. For example, the term \"amino\" is different from the term \"amine\".\nIf you are providing a list, be sure not to list duplicates. \nYour demeanor is empathetic and concise as you aim to help users understand and navigate Alzheimer's-related concerns.\nYou will be provided knowledge within the <Knowledge> tags and must answer the question in the <Question> tags.\nYour response should be within the <Output> tags.\nYou will be asked to answer the question with only the list with each element separated by a newline.\n</Instruction> \n<Knowledge>\n\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.\nThe gene STYXL2 is involved in the molecular function phosphatase activity.\nThe gene STYXL2 is involved in the biological process dephosphorylation.\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity.\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene.\n</Knowledge>\n<Question>List the body parts/anatomy which over-express both the genes METTL5 and STYXL2</Question>\n\n<Approach>\nTo answer the question, follow these steps:\n1. Identify the relevant nodes in the knowledge graph.\n2. Identify the relevant relationships between the nodes.\n3. Generate a response based on the identified nodes and relationships.\n</Approach>\n\n<Examples>\n<Question>True or False Question: AP2M1 is not subject to decreased expression by the drug Botulinum toxin type A</Question>\n<Reasoning>The knowledge graph contains the node AP2M1 and the node Botulinum toxin type A. The knowledge provided contains no link from AP2M1 to Botulinum toxin type A. Therefore, the answer is TRUE.</Reasoning>\n<Output>True</Output>\n\n<Question>Which of the following genes is not under-expressed in testis? 1. FLT1 2. TLE2 3. PDS5A 4. CSF1 5. MGST1</Question>\n<Reasoning>In the knowledge graph, we detect that FLT1, TLE2, CSF1, MGST1 are associated with testis because the body part under-expresses the gene. We also detect that PDS5A is associated with testis because the body part over-expresses the gene. Therefore, the answer is PDS5A.</Reasoning>\n<Output>3. PDS5A</Output>\n</Examples>\n",
          "edge_id": 1,
          "total_edges": 2,
          "knowledge": "\nThe gene METTL5 is associated with the blood, midbrain, urethra, heart, adrenal gland, adipose tissue, smooth muscle tissue, and saliva-secreting gland because these body parts over-express the gene. The gene METTL5 is associated with the lung and nipple because these body parts under-express the gene. The gene METTL5 is associated with the drug Everolimus, Digitoxin, Ouabain, and Bisacodyl because these drugs decrease the gene expression. The gene METTL5 is involved in the molecular functions methyltransferase activity and transferase activity, transferring one-carbon groups. The gene METTL5 is involved in the biological process methylation. Gene METTL5P1, METTL5P2, METTL5P3, and METTL5P4 are pseudogenes for METTL5.\nThe gene STYXL2 is involved in the molecular function phosphatase activity.\nThe gene STYXL2 is involved in the biological process dephosphorylation.\nThe gene STYXL2 is involved in the molecular function phosphoprotein phosphatase activity.\nThe gene STYXL2 is associated with the heart because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac atrium because the body part over-expresses the gene.\nThe gene STYXL2 is associated with the cardiac ventricle because the body part over-expresses the gene."
        }
      ]
    }
  ],
  "edges": [
    ["node_-1", "node_0", ""],
    ["node_0", "node_1", "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!"],
    ["node_0", "node_3", "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"],
    ["node_1", "node_2", "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!"],
    ["node_3", "node_4", "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"],
    ["node_2", "node_5", "BodyPart-BODYPART OVEREXPRESSES GENE-!METTL5!"],
    ["node_4", "node_5", "BodyPart-BODYPART OVEREXPRESSES GENE-!STYXL2!"],
    ["node_5", "node_6", ""]
  ],
  "clusters": [
    { "key": "0", "color": "#00ffbc", "clusterLabel": "Question" },
    { "key": "1", "color": "#ff004f", "clusterLabel": "Generate" },
    { "key": "2", "color": "#23a6d5", "clusterLabel": "Selector" },
    { "key": "3", "color": "#f9a11b", "clusterLabel": "Answer" }
  ],
  "tags": [
    { "key": "Question", "image": "question.svg" },
    { "key": "Generate", "image": "generator.svg" },
    { "key": "Selector", "image": "selector.svg" },
    { "key": "Answer", "image": "answer.svg" }
  ]
}
    
    json_array = json.dumps(result)

    return json_array