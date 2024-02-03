import weaviate
import json
import pandas as pd
import os

from weaviate.util import generate_uuid5

weaviate_client = None
weaviate_url = os.getenv('WEAVIATE_URL')
weaviate_apikey = os.getenv('WEAVIATE_APIKEY')


def get_client(url=weaviate_url):
    auth_config = weaviate.AuthApiKey(api_key=weaviate_apikey)
    global weaviate_client
    if weaviate_client is None:
        weaviate_client = weaviate.Client(
            url=url,
            auth_client_secret=auth_config
        )
        # weaviate_client = weaviate.Client(url=url)
    return weaviate_client


def get_class(class_name):
    return get_client().schema.get(class_name)


# def create_class(class_obj):
#     get_client().schema.create_class(class_obj)
    

def delete_class(class_name):
    get_client().schema.delete_class(class_name)
    

def update_class(class_name, class_obj):
    get_client().schema.update_config(class_name, class_obj)
    

counter = 0
interval = 50

def add_object(class_name, obj) -> None:
    global counter
    # pass these properties via a config file
    


def process_upload():
    pass


def read_class_config():
    with open('data/class.json', 'r') as file:
        data = json.load(file)
    return data


def main():
    # read the json file from the filesystem
    class_obj = read_class_config()
    
    class_name = class_obj['class']
    
    # check if the class already exists
    existing_class = get_class(class_name)
    
    print(existing_class)
    
    # create_class(class_obj)
    # process_upload()


if __name__ == '__main__':
    main()