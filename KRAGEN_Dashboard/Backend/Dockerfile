# Use the existing Python image as base
FROM moorelab/kragen:0.1.0a0

# Set the working directory inside the container
WORKDIR /app

# Copy the code into the container
COPY . /app

# Install dependencies
RUN pip install -r ./ExecGPTServer/requirements.txt
RUN pip install -e graph_of_thoughts
RUN flask --app ExecGPTServer init-db

# Expose the port on which your Flask server will run (if needed)
EXPOSE 5050

# Command to run the Flask server
CMD ["python", "execgpt.py"]
