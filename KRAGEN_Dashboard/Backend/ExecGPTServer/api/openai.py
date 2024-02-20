from flask import Blueprint, jsonify, request
from flask_cors import CORS, cross_origin
from ..server import get_openai_connection

bp = Blueprint('openai', __name__, url_prefix='/openai/v1')


@bp.route('/chat/completions', methods=('POST',))
@cross_origin()
def chat_completions():
    req = request.get_json()
    try:
        openai = get_openai_connection()
        returned_data = openai.ChatCompletion.create(**req)
        print ("returned_data: ", returned_data)
        return returned_data
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/models', methods=['GET'])
@cross_origin()
def models():
    try:
        openai = get_openai_connection()
        print("jsonify(openai.Model.list())",jsonify(openai.Model.list()))

        return jsonify(openai.Model.list())
    except Exception as e:
        return jsonify({'error': str(e)}), 500
