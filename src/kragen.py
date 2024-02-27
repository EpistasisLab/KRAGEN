import sys
import os
import convert as convert
from parse import main as parse
from make_vector_for_in_context_learning_Azure_parallelization_real_dask_7 import main as embed
from addTokenInfo import main as tokenize
from upload import create_class, upload


def config(input_file):
    # read from a yaml file
    kragen_config = {
        'output_directory': os.getenv('CONVERT_OUTPUT_DIR'),
        'convert_chunk_size': os.getenv('CONVERT_CHUNK_SIZE'),
        'output_filename': os.getenv('CONVERT_OUTPUT_FILENAME'),
        'input_file': input_file,

    }
    return kragen_config


def mk_dir(directory):
    os.makedirs(directory, exist_ok=True)


def main():
    command = sys.argv[1]
    # print('command:', command)
    # print("env vars:")
    # for env_var in os.environ.items():
    #     print(env_var)
    # sys.exit(0)
    if command == 'convert':
        if len(sys.argv) != 3:
            print("Usage: docker-compose run kragen convert <csv_file>")
            sys.exit(1)
        # check that the input file exists
        input_csv_file = sys.argv[2]
        if not os.path.isfile(input_csv_file):
            print("File {} does not exist".format(input_csv_file))
            sys.exit(1)
        convert.run(config(input_csv_file))
    elif command == 'parse':
        parse()
    elif command == 'vectorize':
        embed()
    elif command == 'tokenize':
        tokenize()
    elif command == 'create_class':
        create_class()
    elif command == 'upload':
        upload()
    else:
        print("Usage: docker-compose run kragen <command> [<csv_file>]")


if __name__ == "__main__":
    main()
