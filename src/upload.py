import weaviate
import json
import pandas as pd
import os

from weaviate.util import generate_uuid5

weaviate_client = None
weaviate_url = os.getenv('WEAVIATE_URL')
weaviate_apikey = os.getenv('WEAVIATE_APIKEY')
input_dir = os.getenv('INPUT_DIR_DB_UPLOAD')


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
def create_class():
    class_obj = read_json()
    print('got class_obj:', class_obj)
    # get_client().schema.create_class(class_obj)
    

# def delete_class(class_name):
    # get_client().schema.delete_class(class_name)
    

# def update_class(class_name, class_obj):
    # get_client().schema.update_config(class_name, class_obj)
    

counter = 0
interval = 50

def add_object(class_name, obj) -> None:
    global counter
    properties = {
        "knowledge": obj["answer"],
        "knowledge_num_token": obj["answer_num_token"]
    }

    # Convert the string representation of the vector to a list
    vector = [float(val) for val in obj["answer_embedding"].strip('[]').split(',')]
    # print("vector:...")
    # print(vector)

    get_client().batch.configure(batch_size=200)
    with get_client().batch as batch:
        batch.add_data_object(
            data_object=properties,
            class_name=class_name,
            vector=vector,
            uuid=generate_uuid5(obj["answer"])
        )

        counter += 1
        if counter % interval == 0:
            print(f'Imported {counter} objects...')


def batch_load_csv(class_name, csv_filename):
    with pd.read_csv(
            csv_filename,
            usecols=["answer", "answer_embedding", "answer_num_token"],
            chunksize=100,
    ) as csv_iterator:
        for chunk in csv_iterator:
            for index, row in chunk.iterrows():
                add_object(class_name, row)

    print(f'Finished importing {counter} objects.')


def process_directory(class_name, dir_path=os.getcwd()):
    for filename in os.listdir(dir_path):
        if filename.endswith(".csv"):
            csv_filepath = os.path.join(dir_path, filename)
            batch_load_csv(class_name, csv_filepath)


# def process_upload(upload_type):
def upload():
    # client = get_client()
    class_obj = read_json()
    class_name = class_obj["class"]
    # csv_filename = "knowledge.csv"
    # if upload_type == "csv":
    #     batch_load_csv(class_name, csv_filename)
    process_directory(
        class_name,
        dir_path=input_dir
    )


def read_json(filename='data/class.json'):
    with open(filename, 'r') as file:
        data = json.load(file)
    return data


# def main():
#     # read the json file from the filesystem
#     class_obj = read_json()
    
#     class_name = class_obj['class']
    
#     # check if the class already exists
#     existing_class = get_class(class_name)
    
#     print(existing_class)
    
#     # create_class(class_obj)
#     # process_upload()


# if __name__ == '__main__':
#     main()