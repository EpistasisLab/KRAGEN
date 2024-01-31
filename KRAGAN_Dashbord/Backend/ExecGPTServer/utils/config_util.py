import os


def create_config(service, key):
    # result = { 'error': None }
    result = {}

    os.environ['AI_SERVICE'] = service
    os.environ['AI_API_KEY'] = key

    set_key(service, key)

    result['message'] = 'Config created successfully'

    return result


def set_key(service, key):
    if service == 'openai':
        import openai
        openai.api_key = key
