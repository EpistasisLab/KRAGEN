# Use the existing Python image as base
FROM python:3.10-slim

ARG BASE_DIR=KRAGEN_Dashboard/Backend

# Set the working directory inside the container
WORKDIR /app

COPY ${BASE_DIR} /app

RUN apt update --fix-missing \
    && apt upgrade -y \
    && apt install -y gcc python3-dev \
    && pip install --upgrade pip

# Install dependencies
RUN pip install -r /app/ExecGPTServer/requirements.txt
RUN pip install -e /app/graph_of_thoughts
RUN flask --app /app/ExecGPTServer init-db

# Expose the port on which your Flask server will run (if needed)
EXPOSE 5050

# Command to run the Flask server
CMD ["python", "execgpt.py"]