# Use the existing Python image as base
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy only the requirements file to install dependencies
COPY ./ExecGPTServer/requirements.txt .
RUN pip install -r requirements.txt

# Expose the port on which your Flask server will run
EXPOSE 5050

# Command to install GoT and run the Flask server
# If it becomes necessary, we can move this to an entrypoint.sh file.
CMD ["sh", "-c", "pip install -e /app/graph_of_thoughts && flask --app ExecGPTServer init-db && python execgpt.py"]

