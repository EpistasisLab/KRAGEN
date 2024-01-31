# Need to fully test this
# Made this version, since we're focusing on the dev version first.
FROM python:3.10-slim
ARG docker_files=docker
WORKDIR /usr/src/app
COPY src/*.py .
COPY ${docker_files}/requirements.txt requirements.txt
RUN apt update && apt upgrade && pip install --upgrade pip && pip install -r requirements.txt
ENTRYPOINT [ "python", "/usr/src/app/kragen.py" ]
