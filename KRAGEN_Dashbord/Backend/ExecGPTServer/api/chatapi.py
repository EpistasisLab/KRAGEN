from flask import Blueprint, jsonify, request
from flask_cors import CORS, cross_origin
from ..utils import chat_util

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