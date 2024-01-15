import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv()  # This loads the variables from .env

# input_json_file_location = '../data_alzkb_Mythreye_version_3_dataset_disconnectedgenes.json'
input_json_file_location = os.getenv('INPUT_JSON_FILE_LOCATION')
# output_dir = 'divided_data'
output_dir = os.getenv('OUTPUT_DIR')


if __name__ == '__main__':
    # Load the DataFrame
    # df = pd.read_json('../data_alzkb_Nick_version_2.json')
    df = pd.read_json(input_json_file_location)

    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Divide the DataFrame and save each part
    for i in range(0, df.shape[0], 100):
        df[i:i+100].to_csv(f'{output_dir}/data_{i//100}.csv', index=False)