from flask import Blueprint, jsonify, request


bp = Blueprint('routes', __name__, url_prefix='/openai/v1')

@bp.route('/connections', methods=('GET', 'DELETE', 'POST'))
def connections():
    g.ai_conn = AIConn()
    result = { 'error': None }
    status = 405
    if request.method == 'GET':
        result = g.ai_conn.check_connection()
    elif request.method == 'DELETE':
        result = g.ai_conn.disconnect()
    elif request.method == 'POST':
        result = g.ai_conn.connect()
    else:
        result['error'] = 'Invalid request method'

    status = 200 if result['error'] is None else 405
    
    return jsonify(result), status


@bp.route('/models', methods=['GET'])
def models():
    g.ai_conn = AIConn()
    return g.ai_conn.get_models()


@bp.route('/chat/completions', methods=('POST',))
def chat_completions():
    req = request.get_json()
    g.ai_conn = AIConn()
    return g.ai_conn.chat_completions(req)
