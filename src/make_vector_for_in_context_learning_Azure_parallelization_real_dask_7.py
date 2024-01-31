
import os
import pandas as pd
import openai
from dotenv import load_dotenv
# from langchain.embeddings import OpenAIEmbeddings
from openai.embeddings_utils import get_embedding, cosine_similarity
# import tiktoken
import ast
import time
from dask.distributed import Client, as_completed
import dask.dataframe as dd

import logging


load_dotenv()  # This loads the variables from .env


input_dir = os.getenv('INPUT_DIR_FOR_EMBEDDING')
# OUTPUT_DIR_FOR_EMBEDDING
output_dir = os.getenv('OUTPUT_DIR_FOR_EMBEDDING')


openai_api_type = os.getenv('OPENAI_API_TYPE')
openai_api_base = os.getenv('OPENAI_API_BASE')
openai_api_version = os.getenv('OPENAI_API_VERSION')
openai_api_key = os.getenv('OPENAI_API_KEY')
openai_embedding_model = os.getenv('OPENAI_EMBEDDING_MODEL')



# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# search through the reviews for a specific product
def search_docs(df, user_query, top_n=3, to_print=False):
    embedding = get_embedding(
        user_query,
        engine=openai_embedding_model # engine should be set to the deployment name you chose when you deployed the text-embedding-ada-002 (Version 2) model
    )
    df['question_embedding'] = df['question_embedding'].apply(ast.literal_eval)
    df["similarities"] = df['question_embedding'].apply(lambda x: cosine_similarity(x, embedding))

    res = (
        df.sort_values("similarities", ascending=False)
        .head(top_n)
    )
    # if to_print:
    #     display(res)
    return res


def extractUsefulInfoFromData(data_origin_converted, question):
    print("question:", question)
    print("data_origin_converted[train][0]:", data_origin_converted["train"][0])

    len_data_origin_converted = len(data_origin_converted["train"])

    # opanai text embedding for question and each in data_origin_converted["train"]
    # openai_text_embedding = openai.Completion.create(




def process_csv_dask(file_path):
    try:
        df = pd.read_csv(file_path)
        df["question_embedding"] = df["question"].apply(
            lambda x: get_embedding(x, engine=openai_embedding_model)
        )
        df["answer_embedding"] = df["answer"].apply(
            lambda x: get_embedding(x, engine=openai_embedding_model)
        )

        
        os.makedirs(output_dir, exist_ok=True)
        output_file_path = os.path.join(output_dir, os.path.basename(file_path))
        df.to_csv(output_file_path, index=False)

        return output_file_path
    except Exception as e:
        logger.error(f"Error processing {file_path}: {e}")
        return None

def process_all_csv_files(directory):
    client = Client()
    try:
        while True:
            csv_files = [os.path.join(directory, f) for f in os.listdir(directory) if f.endswith('.csv')]
            csv_files.sort()

            only_file_name_csv_files = [os.path.basename(f) for f in csv_files]

           
            # if it exists, get the files names in the directory
            csv_files_embedded = []
            if os.path.exists(output_dir):
                csv_files_embedded = [os.path.join(output_dir, f) for f in os.listdir(output_dir) if f.endswith('.csv')]
                csv_files_embedded.sort()

                only_file_name_csv_files_embedded = [os.path.basename(f) for f in csv_files_embedded]

                diff_csv_files = list(set(only_file_name_csv_files) - set(only_file_name_csv_files_embedded))
                
                # csv_files = list(set(csv_files) - set(csv_files_embedded))

                # correct element in csv_files which also exists in diff_csv_files
                csv_files = [f for f in csv_files if os.path.basename(f) in diff_csv_files]


                # print("csv_files_embedded:", csv_files_embedded)
                # print("csv_files:", csv_files)
                print("len(csv_files):", len(csv_files))
                print("len(csv_files_embedded):", len(csv_files_embedded))
            else:
                print(f"{output_dir} directory does not exist")

            # ... Checking and printing info about embedded files ...


            if len(csv_files) == 0:
                logger.info("No more files to process.")
                
                client.close()  # Ensure client is properly closed
                break

            csv_files_batch = csv_files[:15]
            futures = [client.submit(process_csv_dask, csv_file) for csv_file in csv_files_batch]

            for future in as_completed(futures):
                result = future.result()
                if result is not None:
                    logger.info(f"Processed file: {result}")
                else:
                    
                    logger.warning("A file was not processed due to an error.")
            
            time.sleep(50)


    except Exception as e:
        logger.error(f"An error occurred during processing: {e}")
    finally:
        client.close()  # Ensure client is properly closed


def main():
    process_all_csv_files(input_dir)


if __name__ == '__main__':
    main()


    




    



