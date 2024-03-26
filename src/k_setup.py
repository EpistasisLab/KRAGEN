import click
import os
import sys
import convert as convert
from config import config
from parse import main as parse
from make_vector import main as embed
from addTokenInfo import main as tokenize
from upload import create_class, upload


def setup(filename):

    pad = '*'
    frame = pad * 80

    steps = [
        {
            'name': 'Confirm',
            'msg': 'Ensure that all variables in config/kragen.env and .env are correct',
            'func': None,
            'output': '',
        },
        {
            'name': 'Convert',
            'func': convert.run,
            'arg': config(filename),
            'output': os.path.join(os.getenv('CONVERT_OUTPUT_DIR'),
                                   os.getenv('CONVERT_OUTPUT_FILENAME')),
        },
        {
            'name': 'Parse',
            'func': parse,
            'output': os.getenv('OUTPUT_DIR'),
        },
        # {
        #     'name': 'Vectorize',
        #     'func': embed,
        #     'output': os.getenv('OUTPUT_DIR_FOR_EMBEDDING'),
        # },
        {
            'name': 'Tokenize',
            'func': tokenize,
            'output': os.getenv('OUTPUT_DIR_FOR_ADDING_TOKEN_INFO'),
        },
        {
            'name': 'Upload',
            'func': upload,
            'output': f"Vector database: {os.getenv('WEAVIATE_URL')}",
        }
    ]

    for step in steps:
        msg = f"Executing Step: {step['name']}"
        if 'msg' in step and step['msg']:
            msg += f"\n{step['msg']}"
        info = f'{frame}\n{pad} {msg}\n{frame}'
        if not prompt(info):
            sys.exit(0)
        if 'func' in step and step['func']:
            if 'arg' in step and step['arg']:
                step['func'](step['arg'])
            else:
                step['func']()
        msg = f"Step: {step['name']} complete"
        if 'output' in step and step['output']:
            msg += f"\nCheck Output: {step['output']}"
        info = f'{frame}\n{pad} {msg}\n{frame}'
        if 'output' in step and step['output']:
            if not prompt(info):
                sys.exit(0)
        else:
            print(info)
    info = f'{frame}\n{pad} Process Complete!\n{frame}'
    print(info)


def prompt(msg):
    print(msg)
    return click.confirm('Continue?', default=False)
