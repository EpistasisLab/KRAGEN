import openai
from . import aiconf


class AIConn:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(AIConn, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    # def __init__(self):
    #     # if not self.org_id or not self.api_key:
    #     # if not self.api_key:
    #     self.set_config()

    def set_config(self):
        config = aiconf.get_config()
        # self.org_id = config['org_id']
        self.api_key = config['api_key']
        openai.api_key = self.api_key

    def connect(self):
        self.set_config()
        # settintg the organization does not work
        # openai.organization = self.org_id
        # openai.api_key = self.api_key
        result = {}
        result = self.get_models()
        # if result['error'] is not None:
        if 'error' in result:
            result['message'] = 'Connection failed'
        else:
            result['message'] = 'Connected successfully'
        return result

    def disconnect(self):
        # openai.organization = None
        openai.api_key = None
        return {'message': 'Disconnected successfully', 'error': None}

    def check_connection(self):
        # result = { 'error': None }
        # if openai.api_key == self.api_key and openai.organization == self.org_id:
        # print('openai.api_key: ', openai.api_key)
        # print('self.api_key: ', self.api_key)
        # if openai.api_key == self.api_key:
        result = self.get_models()
        if result['error'] is not None:
            result['message'] = 'Not connected'
        else:
            result['message'] = 'Connected'
        # else:
            # result['message'] = 'Not connected'

        return result

    def get_models(self):
        result = {}
        try:
            models = openai.Model.list()
            result['models'] = models.data
        except Exception as e:
            result['error'] = str(e)

        return result

    def chat_completions(self, req):
        # req['api_key'] = self.api_key
        return openai.ChatCompletion.create(**req)
