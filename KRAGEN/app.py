from flask import Flask, jsonify, request, send_from_directory
import sqlite3
import json
from datetime import datetime

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

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('chats.db')
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        graph_data TEXT,
        controller_file TEXT
    )
    ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
    )
    ''')
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

@app.route('/generate_plans', methods=['POST'])
def generate_plans():
    input_data = request.json.get('input', '')
    chat_id = request.json.get('chat_id', None)
    
    # User message is already saved by the frontend, no need to save again
    
    thoughts = de_escargot.generate_plan(input_data, debug_level=1, max_run_tries = 1)
    #thoughts = de_escargot.ask(input_data)
    new_filename = 'temp/'+str(time.time())+'.pkl'
    de_escargot.save_controller(new_filename)
    
    # Save assistant message and update controller filename
    if chat_id:
        save_message(chat_id, thoughts, 'assistant')
        update_controller_file(chat_id, new_filename)
    
    return jsonify({
        'thoughts': thoughts,
        'filename': new_filename
    })

@app.route('/llm_chat', methods=['POST'])
def llm_chat():
    input_data = request.json.get('input', '')
    chat_id = request.json.get('chat_id', None)
    
    # User message is already saved by the frontend, no need to save again
    
    thoughts = de_escargot.quick_chat(input_data)
    
    # Save assistant message to database
    if chat_id:
        save_message(chat_id, thoughts, 'assistant')
    
    return jsonify({
        'thoughts': thoughts,
    })

@app.route('/generate_code_from_plans', methods=['POST'])
def generate_code_from_plans():
    input_data = request.json.get('input', '')
    question = request.json.get('question', '')
    filename = request.json.get('filename', '')
    chat_id = request.json.get('chat_id', None)
    
    de_escargot.initialize_controller(question,  debug_level = 1, max_run_tries = 1)
    if filename != '':
        de_escargot.load_controller(filename)
    thoughts = de_escargot.generate_code_from_plans()
    new_filename = 'temp/'+str(time.time())+'.pkl'
    de_escargot.save_controller(new_filename)
    
    # Update controller file in database
    if chat_id:
        update_controller_file(chat_id, new_filename)
    
    return jsonify({
        'thoughts': thoughts,
        'filename': new_filename
    })

@app.route('/python_got', methods=['POST'])
def python_got():
    input_data = request.json.get('input', '')
    question = request.json.get('question', '')
    filename = request.json.get('filename', '')
    chat_id = request.json.get('chat_id', None)
    
    try:
        de_escargot.initialize_controller(question,  debug_level = 1, max_run_tries = 3)
        if filename != '':
            de_escargot.load_controller(filename)
        de_escargot.step()
        de_escargot.step()
        de_escargot.step()
        instructions = de_escargot.controller.final_thought.state['instructions']
        print(instructions)
        
        # Extract edge list if it exists in the controller's state. edge_list looks like ['1-2', '2-3', '3-4', '4-5']
        edge_list = []
        if hasattr(de_escargot.controller.final_thought, 'state') and 'original_edges' in de_escargot.controller.final_thought.state:
            edge_list = de_escargot.controller.final_thought.state['original_edges']
        
        new_filename = 'temp/'+str(time.time())+'.pkl'

        de_escargot.controller.execution_queue = None
        de_escargot.controller.got_steps = None
        de_escargot.controller.graph = None
        de_escargot.save_controller(new_filename)
        
        # Update controller file in database if chat_id is provided
        if chat_id:
            update_controller_file(chat_id, new_filename)
        
        return jsonify({
            'instructions': instructions,
            'edgeList': edge_list,
            'filename': new_filename
        })
    except Exception as e:
        print(e)
        return jsonify({
            'error': str(e),
            'message': 'An error occurred while processing the request'
        }), 500
    

# Chat history functions
def save_message(chat_id, message, msg_type):
    conn = sqlite3.connect('chats.db')
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO messages (chat_id, message, type) VALUES (?, ?, ?)',
        (chat_id, message, msg_type)
    )
    conn.commit()
    conn.close()

def update_controller_file(chat_id, filename):
    conn = sqlite3.connect('chats.db')
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE chats SET controller_file = ? WHERE id = ?',
        (filename, chat_id)
    )
    conn.commit()
    conn.close()

def save_graph_data(chat_id, graph_data):
    conn = sqlite3.connect('chats.db')
    cursor = conn.cursor()
    try:
        # First check if the graph data is valid JSON
        json_data = json.dumps(graph_data)
        
        cursor.execute(
            'UPDATE chats SET graph_data = ? WHERE id = ?',
            (json_data, chat_id)
        )
        conn.commit()
        print(f"Graph data saved for chat {chat_id}")
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error saving graph data: {str(e)}")
        return False
    finally:
        conn.close()

@app.route('/create_chat', methods=['POST'])
def create_chat():
    title = request.json.get('title', f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    conn = sqlite3.connect('chats.db')
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO chats (title) VALUES (?)',
        (title,)
    )
    chat_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'chat_id': chat_id,
        'title': title
    })

@app.route('/get_chats', methods=['GET'])
def get_chats():
    conn = sqlite3.connect('chats.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT id, title, created_at FROM chats ORDER BY created_at DESC')
    chats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({
        'chats': chats
    })

@app.route('/get_chat_messages', methods=['GET'])
def get_chat_messages():
    chat_id = request.args.get('chat_id', type=int)
    
    if not chat_id:
        return jsonify({'error': 'Chat ID is required'}), 400
    
    conn = sqlite3.connect('chats.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get chat details
    cursor.execute('SELECT * FROM chats WHERE id = ?', (chat_id,))
    chat = dict(cursor.fetchone() or {})
    
    # Get messages
    cursor.execute('SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp', (chat_id,))
    messages = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    
    return jsonify({
        'chat': chat,
        'messages': messages
    })

@app.route('/save_graph', methods=['POST'])
def save_graph():
    chat_id = request.json.get('chat_id')
    graph_data = request.json.get('graph_data')
    
    if not chat_id or not graph_data:
        return jsonify({'error': 'Chat ID and graph data are required'}), 400
    
    success = save_graph_data(chat_id, graph_data)
    
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Failed to save graph data'}), 500

@app.route('/delete_chat', methods=['POST'])
def delete_chat():
    chat_id = request.json.get('chat_id')
    
    if not chat_id:
        return jsonify({'error': 'Chat ID is required'}), 400
    
    conn = sqlite3.connect('chats.db')
    cursor = conn.cursor()
    
    try:
        # First delete all messages associated with the chat
        cursor.execute('DELETE FROM messages WHERE chat_id = ?', (chat_id,))
        
        # Then delete the chat itself
        cursor.execute('DELETE FROM chats WHERE id = ?', (chat_id,))
        
        conn.commit()
        
        # Check if deletion was successful
        if cursor.rowcount > 0:
            # If there's a controller file associated with this chat, we could delete it here
            # but we'll leave the files for now since they might be useful for debugging
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Chat not found'}), 404
    except sqlite3.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
    
    return jsonify({'success': True})

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

@app.route('/save_message', methods=['POST'])
def save_message_endpoint():
    chat_id = request.json.get('chat_id')
    message = request.json.get('message')
    msg_type = request.json.get('type')
    
    if not chat_id or not message or not msg_type:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    save_message(chat_id, message, msg_type)
    
    return jsonify({
        'success': True
    })

@app.route('/execute_python_step', methods=['POST'])
def execute_python_step():
    input_data = request.json.get('code', '')
    question = request.json.get('question', '')
    filename = request.json.get('filename', '')
    step_id = request.json.get('step_id', '')
    chat_id = request.json.get('chat_id', None)
    
    try:
        # Initialize controller first
        de_escargot.initialize_controller(question, debug_level=1, max_run_tries=3)
        
        # Load controller if filename provided
        if filename:
            de_escargot.load_controller(filename)
        
        # We need to directly execute the code using the coder
        # rather than using step() which requires a specific control flow
        code, compiled = de_escargot.controller.coder.execute_code(
            input_data,
            question,
            step_id,
            de_escargot.controller.prompter,
            de_escargot.controller.logger
        )
        
        # Save controller state after execution
        new_filename = 'temp/'+str(time.time())+'.pkl'
        de_escargot.save_controller(new_filename)
        
        # Update controller file in database if chat_id is provided
        if chat_id:
            update_controller_file(chat_id, new_filename)
        
        # Get the local context for this step
        local_context = {}
        if step_id in de_escargot.controller.coder.local_context_by_step:
            local_context = de_escargot.controller.coder.local_context_by_step[step_id]
        else:
            # If step_id not in local_context_by_step, use the current local context
            local_context = de_escargot.controller.coder.local_context
        
        # Get step output
        step_output = {}
        if step_id in de_escargot.controller.coder.step_output:
            step_output = de_escargot.controller.coder.step_output[step_id]
        
        return jsonify({
            'success': compiled,
            'code': code,
            'local_context': str(local_context),
            'step_output': str(step_output),
            'filename': new_filename,
            'next_step_id': str(int(step_id) + 1) if step_id.isdigit() else ""
        })
    except Exception as e:
        print(e)
        return jsonify({
            'error': str(e),
            'success': False,
            'message': 'An error occurred while executing the Python code'
        }), 500

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
