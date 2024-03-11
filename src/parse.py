import os
import pandas as pd
from dotenv import load_dotenv

# Specify the path to 'kragen.env' file instead of the default '.env' file
dotenv_path = os.path.join(os.getcwd(), 'config', 'kragen.env')
load_dotenv(dotenv_path)  # This loads the variables from 'kragen.env'

# Change: Instead of getting the location of a JSON file, get the location of a CSV file from the environment variables.
input_csv_file_location = os.getenv('INPUT_CSV_FILE_LOCATION')
output_dir = os.getenv('OUTPUT_DIR')

def main():
    print("input_csv_file_location:", input_csv_file_location)
    # Load the DataFrame from a CSV file instead of a JSON file
    df = pd.read_csv(input_csv_file_location)

    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Divide the DataFrame and save each part as a CSV file
    for i in range(0, df.shape[0], 100):
        df[i:i+100].to_csv(f'{output_dir}/data_{i//100}.csv', index=False)


if __name__ == '__main__':
    main()
