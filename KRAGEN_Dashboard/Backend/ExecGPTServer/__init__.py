from flask import Flask
from flask_cors import CORS
from .utils import util
import os


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'ExecGPTServer.sqlite'),
    )

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # ai_service = "AI_SERVICE"
    # api_key = "AI_API_KEY"

    # if ai_service not in os.environ:
    #     os.environ[ai_service] = "openai"

    # if api_key not in os.environ:
    #     print(f"The '{api_key}' environment variable is not set.")
    #     print('Please set it and try again.')
    #     exit(1)

    cors = CORS(app, origins=util.client_origins)

    from .db import db
    db.init_app(app)

    from . import server
    app.register_blueprint(server.bp)

    from .api import api
    app.register_blueprint(api.bp)

    from .api import openai
    app.register_blueprint(openai.bp)

    from .api import execapi
    app.register_blueprint(execapi.bp)

    from .api import chatapi
    app.register_blueprint(chatapi.bp)

    return app
