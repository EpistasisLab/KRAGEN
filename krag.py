import sys
import os
import convert


def config(input_file):
    # read from a yaml file
    krag_config = {
        'output_directory': 'target',
        'convert_chunk_size': 5,
        'convert_output_filename': 'converted.csv',
        'input_file': input_file,

    }
    return krag_config


def mk_dir(directory):
    os.makedirs(directory, exist_ok=True)


def main():
    if len(sys.argv) != 2:
        print("Usage: python krag.py <csv_file>")
        sys.exit(1)

    # check that the input file exists
    input_csv_file = sys.argv[1]
    if not os.path.isfile(input_csv_file):
        print("File {} does not exist".format(input_csv_file))
        sys.exit(1)

    convert.run(config(input_csv_file))


if __name__ == "__main__":
    main()
