from flask import Blueprint, jsonify, request
from flask_cors import CORS, cross_origin
from ..utils import config_util

bp = Blueprint('api', __name__, url_prefix='/api/v1')

# Enable CORS on the blueprint
CORS(bp, origins='http://localhost:3000')

@bp.route('/configs', methods=['POST'])
@cross_origin() 
def create_config():
    req = request.get_json()
    if 'service' not in req:
        return jsonify({'error': 'Missing service parameter'}), 400

    if 'key' not in req:
        return jsonify({'error': 'Missing key parameter'}), 400

    result = config_util.create_config(req['service'], req['key'])

    # if 'error' in result and result['error'] is not None:
    if 'error' in result:
        return jsonify({'error': result['error']}), 500

    return jsonify(result), 200
