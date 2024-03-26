import sys
import os
import convert as convert
from parse import main as parse
from make_vector import main as embed
from addTokenInfo import main as tokenize
from upload import create_class, upload
from k_setup import setup
from config import config


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
            # print("File {} does not exist".format(input_csv_file))
            print(f"File {input_csv_file} does not exist")
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
    elif command == 'setup':
        if len(sys.argv) != 3:
            print("Usage: docker-compose run kragen setup <csv_file>")
            sys.exit(1)
        # check that the input file exists
        input_csv_file = sys.argv[2]
        if not os.path.isfile(input_csv_file):
            print(f"File {input_csv_file} does not exist")
            sys.exit(1)
        setup(input_csv_file)
    else:
        print("Usage: docker-compose run kragen <command> [<csv_file>]")


if __name__ == "__main__":
    main()
