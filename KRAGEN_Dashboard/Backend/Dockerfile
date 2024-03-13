# Use the existing Python image as base
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the code into the container
COPY . /app

# Install dependencies
RUN pip install -r ./ExecGPTServer/requirements.txt
RUN pip install -e graph_of_thoughts

# Expose the port on which your Flask server will run (if needed)
EXPOSE 5050

# Command to run the Flask server
CMD ["python", "execgpt.py"]
