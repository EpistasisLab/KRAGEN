from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='static')
import dill
import os
import agents.score_agent as score_agent
from config import config

de_escargot = score_agent.DEEscargot(config, node_types = "BiologicalProcess, BodyPart, CellularComponent, Datatype, Disease, Drug, DrugClass, Gene, MolecularFunction, Pathway, Symptom", relationship_types = """CHEMICALBINDSGENE
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
relationship_scores="""CHEMICALBINDSGENE	['sourceDB', ' unbiased', ' affinity_nM']
CHEMICALDECREASESEXPRESSION	['sourceDB', ' unbiased', ' z_score']
CHEMICALINCREASESEXPRESSION	['sourceDB', ' unbiased', ' z_score']
DISEASELOCALIZESTOANATOMY	['sourceDB', ' unbiased', ' p_fisher']
GENEASSOCIATESWITHDISEASE	['sourceDB', ' score']
GENECOVARIESWITHGENE	['sourceDB', ' unbiased', ' correlation']
SYMPTOMMANIFESTATIONOFDISEASE	['sourceDB', ' unbiased', ' p_fisher']
TRANSCRIPTIONFACTORINTERACTSWITHGENE	['sourceDB', ' confidence']""" ,
# model_name="azuregpt35-16k")
# model_name="azuregpt4o")
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
    thoughts = de_escargot.generate_plan(input_data, debug_level=0, max_run_tries = 1)
    return jsonify({
        'thoughts': thoughts,
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
