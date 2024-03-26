import os


def config(input_file):
    # read from a yaml file
    kragen_config = {
        'output_directory': os.getenv('CONVERT_OUTPUT_DIR'),
        'convert_chunk_size': os.getenv('CONVERT_CHUNK_SIZE'),
        'output_filename': os.getenv('CONVERT_OUTPUT_FILENAME'),
        'input_file': input_file,

    }
    return kragen_config
