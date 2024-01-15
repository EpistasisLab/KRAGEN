# Project Documentation

## 0. Environment Setup and 
Create an environment by installing the required packages from `requirements.txt`. Python version 3.10 is recommended. 

In addition please set the following environment variables in the `.env` file:
```
# parse.py settings
INPUT_JSON_FILE_LOCATION = 
OUTPUT_DIR =

# make_vector_for_in_context_learning_Azure_parallelization_real_dask_7.py
# 
INPUT_DIR_FOR_EMBEDDING =
OUTPUT_DIR_FOR_EMBEDDING =


# Azure OpenAI API
OPENAI_API_TYPE=
OPENAI_API_BASE=
OPENAI_API_VERSION=
OPENAI_API_KEY=
OPENAI_EMBEDDING_MODEL=
```

## 1. run parse.py
This script is used for parsing data.

## 2. run make_vector_for_in_context_learning_Azure_parallelization_real_dask_7.py
This script creates vectors for in-context learning. It utilizes Azure for parallelization and is implemented using Dask.

## 3. run addTokenInfo.py
This script adds tokens for divided data that has been embedded.