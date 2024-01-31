# ExecGPT

## Installation
It is recommended that you use a python [virtual environment](https://docs.python.org/3/library/venv.html)

To install dependencies, from within the ExecGPT directory run:
```
$ pip install -r ExecGPTServer/requirements.txt
```

Copy the .env.sample file as .env

```
$ cp .env.sample .env
```

In the .env file, variable **CODE_RUN_PATH** is the filepath where code executions will run.

## Setup
### Database
The database needs to be initialized the first time you run the app. To initialize it run the following command within the ExecGPT directory:
```
$ flask --app ExecGPTServer init-db
```

### API KEY
An active api key is required to run this application.

The api key can be set either via the GUI or the command line.

#### GUI
[coming soon]

#### Command Line

Your api key can be set via an environmental variable:
```
$ export AI_API_KEY=[your api key]
```

OpenAI is the default service used. If you prefer to use a different service, you may set it in the AI_SERVICE environmental variable (see the list of supported services below)

```
$ export AI_SERVICE=[service]
```

**Note:** the **AI_SERVICE** and **AI_API_KEY** environmental variables can also be set in the .env file.

### Supported services
- OpenAI
