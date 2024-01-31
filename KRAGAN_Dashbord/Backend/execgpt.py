import subprocess
import sys


def main():
    args = ["flask", "--app", "ExecGPTServer", "run", "--port", "5050"]
    arguments = sys.argv[1:]

    if len(arguments) > 0 and arguments[0] == "debug":
        args.append("--debug")
    # temporarily default to debug
    args.append("--debug")

    subprocess.call(args)


if __name__ == "__main__":
    main()
