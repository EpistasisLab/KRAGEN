FROM python:3.10-slim
# ARG docker_files=docker/convert
ARG docker_files=docker
WORKDIR /usr/src/app
# WORKDIR /app
# COPY src/*.py .
COPY ${docker_files}/requirements.txt requirements.txt
RUN apt update && apt upgrade -y && pip install --upgrade pip && pip install -r requirements.txt
ENTRYPOINT [ "python", "/usr/src/app/kragen.py" ]
