from ..db.db import get_db
from io import StringIO
import subprocess
import os
import sys
import json


def create_execution(src_code):
    # result = { 'error': None }
    result = {}
    db = get_db()
    try:
        cursor = db.execute(
            'INSERT INTO execution (status, src_code)'
            ' VALUES (?, ?)',
            ('submitted', src_code)
        )
        db.commit()
        result['id'] = cursor.lastrowid
        result['message'] = 'Execution saved successfully'
    except Exception as e:
        print(e)
        result['error'] = str(e)

    return result


def get_execution(execution_id):
    # result = { 'error': None }
    result = {}
    db = get_db()
    try:
        row = db.execute(
            'SELECT * FROM execution WHERE id = ?',
            (execution_id,)
        ).fetchone()

        if row is None:
            result['error'] = 'Execution id {} does not exist'.format(execution_id)
        else:
            result['execution'] = dict(row)
            result['message'] = 'Execution retrieved successfully'
    except Exception as e:
        result['error'] = str(e)

    return result


# this contradicts the flexibility of saving executed files anywhere on the FS.
def update_execution(execution):
    # result = { 'error': None }
    result = {}
    db = get_db()
    query = 'UPDATE execution SET'
    parameters = []
    if 'status' in execution:
        query += ' status = ?,'
        parameters.append(execution['status'])
    if 'result' in execution:
        query += ' result = ?,'
        parameters.append(execution['result'])
    if 'files' in execution:
        query += ' files = ?,'
        parameters.append(execution['files'])
    query = query[:-1] + ' WHERE id = ?'
    parameters.append(execution['id'])

    try:
        db.execute(query, parameters)
        db.commit()
        result['message'] = 'Execution updated successfully'
    except Exception as e:
        result['error'] = str(e)

    return result


def run_code(execution, run_dir):
    try:
        current_dir = os.getcwd()
        os.chdir(run_dir)

        stdout_backup = sys.stdout
        sys.stdout = StringIO()

        exec(execution['src_code'])

        execution['result'] = sys.stdout.getvalue()
        sys.stdout = stdout_backup

        os.chdir(current_dir)

        if execution['result'] is None:
            execution['result'] = ''

        execution['status'] = 'completed'

    except Exception as e:
        execution['result'] = str(e)
        execution['status'] = 'failed'

    return execution


def create_code_run_dir(execution_id):
    # check if run_dir exists
    # if not, create it
    # return run_dir
    current_dir = os.getcwd()
    run_dir = os.path.join(current_dir, os.environ['CODE_RUN_PATH'], str(execution_id))

    if not os.path.exists(run_dir):
        os.makedirs(run_dir)

    return run_dir


def add_generated_files(run_dir):
    files = []
    for file in os.listdir(run_dir):
        file = os.path.join(run_dir, file)
        # print the file path relative to the current working directory
        # print(os.path.relpath(file, os.getcwd()))
        if os.path.isfile(file):
            # uncomment this line to save relative path instead of full path:
            file = os.path.relpath(file, os.getcwd())
            files.append(file)

    return ','.join(files)


def get_packages():
    # result = { 'error': None }
    result = {}
    try:
        result['packages'] = subprocess.check_output(['pip', 'list', '--format', 'json'], stderr=subprocess.STDOUT)
        result['packages'] = [package['name'] for package in json.loads(result['packages'])]
    except Exception as e:
        result['error'] = str(e)

    return result


def install_packages(packages):
    # result = { 'error': None }
    result = {}
    try:
        result['message'] = subprocess.check_output(['pip', 'install', *packages], stderr=subprocess.STDOUT)
        # parse the output to get the message and return it as proper json
        result['message'] = result['message'].decode('utf-8').split('\n')
        result['message'] = [line for line in result['message'] if line != '']
        print('before pop')
        print(result['message'])
        result['message'] = result['message'][-1]
        print('after pop')
        print(result['message'])
    except Exception as e:
        result['error'] = str(e)

    return result
