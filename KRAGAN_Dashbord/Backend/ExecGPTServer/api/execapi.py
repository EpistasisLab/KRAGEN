from flask import Blueprint, jsonify, request
from flask_cors import CORS, cross_origin
from ..utils import exec_util

bp = Blueprint('execapi', __name__, url_prefix='/execapi/v1')

# Enable CORS on the blueprint
CORS(bp, origins='http://localhost:3000')


@bp.route('/executions', methods=['POST'])
@bp.route('/executions/<int:execution_id>', methods=['GET'])
@cross_origin() 
def executions(execution_id=None):
    execution = {}
    if request.method == 'POST':
        req = request.get_json()

        if 'src_code' not in req:
            return jsonify({'error': 'Missing src_code parameter'}), 400

        execution = exec_util.create_execution(req['src_code'])

        # if 'error' in execution and execution['error'] is not None:
        if 'error' in execution:
            return jsonify({'error': execution['error']}), 500

        execution['src_code'] = req['src_code']

        run_dir = exec_util.create_code_run_dir(execution['id'])

        execution = exec_util.run_code(execution, run_dir)

        execution['files'] = exec_util.add_generated_files(run_dir)

        exec_util.update_execution(execution)

    elif request.method == 'GET':
        execution = exec_util.get_execution(execution_id)
        # if 'error' in execution and execution['error'] is not None:
        if 'error' in execution:
            return jsonify({'error': execution['error']}), 500

    return jsonify(execution), 200


@bp.route('/packages', methods=('GET', 'POST'))
@cross_origin() 
def packages():
    if request.method == 'GET':
        result = exec_util.get_packages()
        # if 'error' in result and result['error'] is not None:
        if 'error' in result:
            return result, 500

        return jsonify(result), 200
    else:
        req = request.get_json()
        if 'packages' not in req:
            return jsonify({'error': 'Missing packages parameter'}), 400

        result = exec_util.install_packages(req['packages'])
        # if 'error' in result and result['error'] is not None:
        if 'error' in result:
            return jsonify({'error': result['error']}), 500
        else:
            return jsonify(result), 200
