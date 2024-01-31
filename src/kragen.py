import sys
import os
import convert as convert
from parse import main as parse
from make_vector_for_in_context_learning_Azure_parallelization_real_dask_7 import main as embed
from addTokenInfo import main as tokenize


def config(input_file):
    # read from a yaml file
    kragen_config = {
        'output_directory': 'target',
        'convert_chunk_size': 5,
        'convert_output_filename': 'converted.csv',
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
            print("Usage: docker run convert <csv_file>")
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
    else:
        print("Usage: docker run <command> [<csv_file>]")


if __name__ == "__main__":
    main()
