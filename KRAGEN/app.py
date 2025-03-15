from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='static')
import dill
import os
#import agents.score_agent as score_agent
import escargot
from config import config
import time

de_escargot = escargot.Escargot(config, node_types = "BiologicalProcess, BodyPart, CellularComponent, Datatype, Disease, Drug, DrugClass, Gene, MolecularFunction, Pathway, Symptom", relationship_types = """CHEMICALBINDSGENE
CHEMICALDECREASESEXPRESSION
CHEMICALINCREASESEXPRESSION
DRUGINCLASS
DRUGCAUSESEFFECT
DRUGTREATSDISEASE
GENEPARTICIPATESINBIOLOGICALPROCESS
GENEINPATHWAY
GENEINTERACTSWITHGENE
GENEHASMOLECULARFUNCTION
GENEASSOCIATEDWITHCELLULARCOMPONENT
GENEASSOCIATESWITHDISEASE
SYMPTOMMANIFESTATIONOFDISEASE
BODYPARTUNDEREXPRESSESGENE
BODYPARTOVEREXPRESSESGENE
DISEASELOCALIZESTOANATOMY
DISEASEASSOCIATESWITHDISEASET""",
model_name="azuregpt-4o-mini")
de_escargot.memgraph_client.schema = """Node properties are the following:
Node name: 'BiologicalProcess', Node properties: ['commonName']
Node name: 'BodyPart', Node properties: ['commonName']
Node name: 'CellularComponent', Node properties: ['commonName']
Node name: 'Disease', Node properties: ['commonName']
Node name: 'Drug', Node properties: ['commonName']
Node name: 'DrugClass', Node properties: ['commonName']
Node name: 'Gene', Node properties: ['commonName', 'geneSymbol', 'typeOfGene']
Node name: 'MolecularFunction', Node properties: ['commonName']
Node name: 'Pathway', Node properties: ['commonName']
Node name: 'Symptom', Node properties: ['commonName']
Relationship properties are the following:
The relationships are the following:
(:Drug)-[:CHEMICALBINDSGENE]-(:Gene)
(:Drug)-[:CHEMICALDECREASESEXPRESSION]-(:Gene)
(:Drug)-[:CHEMICALINCREASESEXPRESSION]-(:Gene)
(:Drug)-[:DRUGINCLASS]-(:DrugClass)
(:Drug)-[:DRUGCAUSESEFFECT]-(:Disease)
(:Drug)-[:DRUGTREATSDISEASE]-(:Disease)
(:Gene)-[:GENEPARTICIPATESINBIOLOGICALPROCESS]-(:BiologicalProcess)
(:Gene)-[:GENEINPATHWAY]-(:Pathway)
(:Gene)-[:GENEINTERACTSWITHGENE]-(:Gene)
(:Gene)-[:GENEHASMOLECULARFUNCTION]-(:MolecularFunction)
(:Gene)-[:GENEASSOCIATEDWITHCELLULARCOMPONENT]-(:CellularComponent)
(:Gene)-[:GENEASSOCIATESWITHDISEASE]-(:Disease)
(:Symptom)-[:SYMPTOMMANIFESTATIONOFDISEASE]-(:Disease)
(:BodyPart)-[:BODYPARTUNDEREXPRESSESGENE]-(:Gene)
(:BodyPart)-[:BODYPARTOVEREXPRESSESGENE]-(:Gene)
(:Disease)-[:DISEASELOCALIZESTOANATOMY]-(:BodyPart)
(:Disease)-[:DISEASEASSOCIATESWITHDISEASET]-(:Disease)"""


@app.route('/generate_plans', methods=['POST'])
def generate_plans():
    input_data = request.json.get('input', '')
    thoughts = de_escargot.generate_plan(input_data, debug_level=1, max_run_tries = 1)
    #thoughts = de_escargot.ask(input_data)
    new_filename = 'temp/'+str(time.time())+'.pkl'
    de_escargot.save_controller(new_filename)
    #save_controller(de_escargot.controller,filename)
    return jsonify({
        'thoughts': thoughts,
        'filename': new_filename
    })

@app.route('/llm_chat', methods=['POST'])
def llm_chat():
    input_data = request.json.get('input', '')
    thoughts = de_escargot.quick_chat(input_data)
    return jsonify({
        'thoughts': thoughts,
    })

@app.route('/generate_code_from_plans', methods=['POST'])
def generate_code_from_plans():
    input_data = request.json.get('input', '')
    question = request.json.get('question', '')
    filename = request.json.get('filename', '')
    de_escargot.initialize_controller(question,  debug_level = 1, max_run_tries = 1)
    if filename != '':
        de_escargot.load_controller(filename)
    else:
        return None
    thoughts = de_escargot.generate_code_from_plans()
    new_filename = 'temp/'+str(time.time())+'.pkl'
    de_escargot.save_controller(new_filename)
    #save_controller(de_escargot.controller,new_filename)
    return jsonify({
        'thoughts': thoughts,
        'filename': new_filename
    })

@app.route('/python_got', methods=['POST'])
def python_got():
    input_data = request.json.get('input', '')
    question = request.json.get('question', '')
    filename = request.json.get('filename', '')
    de_escargot.initialize_controller(question,  debug_level = 1, max_run_tries = 1)
    if filename != '':
        de_escargot.load_controller(filename)
    else:
        return None
    de_escargot.step()
    de_escargot.step()
    de_escargot.step()
    instructions = de_escargot.controller.final_thought.state['instructions']
    print(instructions)
    new_filename = 'temp/'+str(time.time())+'.pkl'

    de_escargot.controller.execution_queue = None
    de_escargot.controller.got_steps = None
    de_escargot.controller.graph = None
    de_escargot.save_controller(new_filename)
    return jsonify({
        'instructions': instructions,
        'filename': new_filename
    })

@app.route('/run_node', methods=['POST'])
def run_node():
    node_id = request.json.get('node_id')
    # Implement logic to run a single node
    return jsonify({'result': f'Node {node_id} executed'})

@app.route('/run_graph', methods=['POST'])
def run_graph():
    # Implement logic to run the entire graph
    return jsonify({'result': 'Graph executed'})

@app.route('/pull_knowledge', methods=['POST'])
def pull_knowledge():
    input_data = request.json.get('input', '')
    knowledge = de_escargot.get_knowledge(input_data, "Return the knowledge")
    return jsonify({
        'knowledge': knowledge
    }) 

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
