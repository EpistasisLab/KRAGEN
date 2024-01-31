from flask import Blueprint, jsonify, request, g
from flask_cors import CORS, cross_origin
import os
from ExecGPTServer.utils import chat_util

bp = Blueprint('routes', __name__)

# Enable CORS on the blueprint
CORS(bp, origins='http://localhost:3000')


# bp = Blueprint('routes', __name__, url_prefix='/openai/v1')
bp = Blueprint('routes', __name__)
ai_service = os.environ['AI_SERVICE']

if ai_service == 'openai':
    import openai
    openai.api_key = os.environ['AI_API_KEY']


def get_openai_connection():
    if 'openai_conn' not in g:
        g.openai_conn = openai

    return g.openai_conn


@bp.route('/', methods=['GET'])
@cross_origin() 
def index():
    # replace this with the actual index page in React
    # for example:
    # return current_app.send_static_file('build/index.html')
    return jsonify({'message': 'Hello, world!'}), 200


@bp.route('/chatlogs', methods=['GET'])
@cross_origin() 
def getchatlogs():
    req = request.get_json()
    if 'chatname' not in req:
        return jsonify({'error': 'Missing chatname parameter'}), 400

    chatname = req['chatname']
    if not isinstance(chatname, str):
        return jsonify({'error': 'Chatname parameter must be a string'}), 400

    # return jsonify(chat.get_chat_entries(chatname)), 200
    result = chat_util.get_chat_entries(chatname)
    result['chatname'] = chatname
    return result, 200


@bp.route('/chatlogs', methods=['POST'])
@cross_origin() 
def addchatlog():
    req = request.get_json()
    if 'chatname' not in req:
        return jsonify({'error': 'Missing chatname parameter'}), 400

    chatname = req['chatname']
    if not isinstance(chatname, str):
        return jsonify({'error': 'Chatname parameter must be a string'}), 400

    if 'user' not in req:
        return jsonify({'error': 'Missing user parameter'}), 400

    user = req['user']
    if not isinstance(user, str):
        return jsonify({'error': 'User parameter must be a string'}), 400

    if 'message' not in req:
        return jsonify({'error': 'Missing message parameter'}), 400

    message = req['message']
    if not isinstance(message, str):
        return jsonify({'error': 'Message parameter must be a string'}), 400

    return jsonify(chat_util.add_chat_entry(chatname, req)), 200
