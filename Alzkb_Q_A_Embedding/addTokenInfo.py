# 3. addtokens for divided_data_embedded

# read csv files from divided_data_embedded
import os
import pandas as pd
import nltk
from nltk.tokenize import word_tokenize

# Download the necessary NLTK models (if not already downloaded)
nltk.download('punkt')

# input_dir = 'divided_data_embedded'
# output_dir = 'divided_data_embedded_addtokens'

input_dir = 'divided_data_v3_dataset_disconnectedgenes_embedded'
output_dir = 'divided_data_v3_dataset_disconnectedgenes_embedded_addtokens'

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



