# 3. addtokens for divided_data_embedded

# read csv files from divided_data_embedded
import os
import pandas as pd
import nltk
from nltk.tokenize import word_tokenize
from dotenv import load_dotenv
# Download the necessary NLTK models (if not already downloaded)
nltk.download('punkt')

# Specify the path to 'kragen.env' file instead of the default '.env' file
dotenv_path = os.path.join(os.getcwd(), 'config', 'kragen.env')
load_dotenv(dotenv_path)  # This loads the variables from 'kragen.env'


# INPUT_DIR_FOR_ADDING_TOKEN_INFO 
input_dir = os.getenv('INPUT_DIR_FOR_ADDING_TOKEN_INFO')
# OUTPUT_DIR_FOR_ADDING_TOKEN_INFO
output_dir = os.getenv('OUTPUT_DIR_FOR_ADDING_TOKEN_INFO')

def main():
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # check the number of csv files in input_dir
    csv_files = [os.path.join(input_dir, f) for f in os.listdir(input_dir) if f.endswith('.csv')]
    csv_files.sort()


    for file in csv_files:
        df = pd.read_csv(file)
        
        # Here we assume 'question' is the name of the column containing the text to be tokenized.
        # df['question_num_token'] = df['question'].apply(lambda x: len(x.split()) if pd.notnull(x) else 0)

        # USE tokenizer.tokenize(sentence) to GET LENGTH OF TOKENS
        df['question_num_token'] = df['question'].apply(lambda x: len(word_tokenize(x)) if pd.notnull(x) else 0)


        # df['answer_num_token'] = df['answer'].apply(lambda x: len(x.split()) if pd.notnull(x) else 0)
        # output_dir + '/' + os.path.basename(file)

        # Use the tokenizer to tokenize the text
        df['answer_num_token'] = df['answer'].apply(lambda x: len(word_tokenize(x)) if pd.notnull(x) else 0)

        df.to_csv(output_dir + '/' + os.path.basename(file), index=False)  # Saving the DataFrame back to CSV, without the index.


if __name__ == '__main__':
    main()
