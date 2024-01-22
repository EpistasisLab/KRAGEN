FROM python:3.12-slim

ARG docker_files=docker/convert

WORKDIR /app

COPY ${docker_files}/requirements.txt requirements.txt

RUN apt update && apt upgrade && pip install --upgrade pip && pip install -r requirements.txt

CMD ["python", "--version"]
