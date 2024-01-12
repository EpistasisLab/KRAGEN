import os

import dask.dataframe as dd

def process_row(row):
    print(row)
    return row

def mk_dir(directory):
    os.makedirs(directory, exist_ok=True)

def read_file(input_csv_file, chunk_size=5):
    ddf = dd.read_csv(input_csv_file, blocksize=chunk_size * 1000)
    return ddf

def convert_csv(ddf):
    # processed_ddf = ddf.map_partitions(lambda part: part.apply(process_row, axis=1, column_mapping=column_mapping), meta=ddf)
    processed_ddf = ddf.map_partitions(lambda part: part.apply(process_row, axis=1), meta=ddf)
    return processed_ddf

# Save the Dask DataFrame to CSV files
def save_csv(ddf, output_directory):
    ddf.to_csv(os.path.join(output_directory, 'output_chunk_*.csv'), index=False, single_file=False)

def run(config):
    ddf = read_file(config['input_file'])
    converted_ddf = convert_csv(ddf)
    mk_dir(config['output_directory'])
    save_csv(converted_ddf, config['output_directory'])