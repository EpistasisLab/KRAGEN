import click
import os
import sys
import json
import convert as convert
from config import config
from parse import main as parse
from make_vector import main as embed
from addTokenInfo import main as tokenize
from upload import create_class, upload


def setup(filename, configure_backend=True):

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
        {
            'name': 'Vectorize',
            'func': embed,
            'output': os.getenv('OUTPUT_DIR_FOR_EMBEDDING'),
        },
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

    if configure_backend:
        config_backend()

    info = f'{frame}\n{pad} Process Complete!\n{frame}'
    print(info)


def prompt(msg):
    print(msg)
    return click.confirm('Continue?', default=False)


def config_backend(service='chatgpt'):

    print(f'configuring service: {service}')

    backend_path = os.getenv('KRAGEN_BACKEND_PATH')
    sample_filename = os.getenv('BACKEND_CONFIG_FILENAME')
    openai_api_key = os.getenv('OPENAI_API_KEY')
    embedding_model = os.getenv('OPENAI_EMBEDDING_MODEL')
    # prompt_token_cost = os.getenv('PROMPT_TOKEN_COST')
    # the response_token_cost is currently defined as a different
    # value for multiple models in the config.json file.
    # response_token_cost = os.getenv('RESPONSE_TOKEN_COST')
    gpt_api_version = os.getenv('GPT_API_VERSION')
    gpt_api_base = os.getenv('GPT_API_BASE')
    # weaviate variables
    weaviate_url = os.getenv('WEAVIATE_URL')
    weaviate_api_key = os.getenv('WEAVIATE_API_KEY')

    sample_config = os.path.join(backend_path, sample_filename)
    config_file = os.path.join(backend_path, 'config.json')

    with open(sample_config, 'r') as f:
        data = json.load(f)
        if not service in data:
            print(f'{service} is not a key in {sample_config}')
            return

        if not 'api_key' in data[service]:
            print(f"'api_key' is not a key in {service}: {data[service]}")
            return 

        data[service]['api_key'] = openai_api_key

        if embedding_model is not None and 'embedding_id' in data[service]:
            data[service]['embedding_id'] = embedding_model

        if gpt_api_version is not None and 'api_version' in data[service]:
            data[service]['api_version'] = gpt_api_version

        if gpt_api_base is not None and 'api_base' in data[service]:
            data[service]['api_base'] = gpt_api_base
        
        # set weaviate variables
        if 'weaviate' in data:
            if weaviate_url is not None and 'url' in data['weaviate']:
                data['weaviate']['url'] = weaviate_url
            if weaviate_api_key is not None and 'api_key' in data['weaviate']:
                data['weaviate']['api_key'] = weaviate_api_key

        json_data = json.dumps(data, indent=2)

        with open(config_file, 'w') as outfile:
            outfile.write(json_data)
            print(f'file: {config_file} configured.')

