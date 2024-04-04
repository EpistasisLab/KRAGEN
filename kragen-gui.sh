#!/bin/bash

# Copy .env file and replace the value of the 11th line
# cp ./KRAGEN_Dashboard/Backend/config.json.sample ./KRAGEN_Dashboard/Backend/config.json

# openaikey=$(awk 'NR == 11 {print}' .env)
# openaikey=$(echo $openaikey | cut -d'=' -f2)

# weaviatekey=$(awk 'NR == 16 {print}' .env)
# weaviatekey=$(echo $weaviatekey | cut -d'=' -f2)

# weaviateurl=$(awk 'NR == 15 {print}' .env)
# weaviateurl=$(echo $weaviateurl | cut -d'=' -f2)

# awk -v value="$openaikey" 'NR == 28 {$0 = "\"api_key\": \"" value "\", "} 1' ./KRAGEN_Dashboard/Backend/config.json > temp && mv temp ./KRAGEN_Dashboard/Backend/config.json

# awk -v value="$weaviatekey" 'NR == 15 {$0 = "\"api_key\": \"" value "\", "} 1' ./KRAGEN_Dashboard/Backend/config.json > temp && mv temp ./KRAGEN_Dashboard/Backend/config.json

# awk -v value="$weaviateurl" 'NR == 16 {$0 = "\"url\": \"" value "\", "} 1' ./KRAGEN_Dashboard/Backend/config.json > temp && mv temp ./KRAGEN_Dashboard/Backend/config.json

# Start Flask server in Docker container
# cd ./KRAGEN_Dashboard/Backend

# IMAGE_NAME="kragen-flask-server"
# # Check if the Docker image already exists
# if docker images "$IMAGE_NAME" | grep -q "$IMAGE_NAME"; then
#     echo "Docker image $IMAGE_NAME already exists. Skipping build."
# else
#     echo "Docker image $IMAGE_NAME does not exist. Building..."
#     docker build -t "$IMAGE_NAME" .
# fi

# Source environment variables from the .env file
source .env

# Display the OpenAI API key, Weaviate URL, and Weaviate API key for verification
echo "OPENAI_API_KEY: $OPENAI_API_KEY"
echo "WEAVIATE_URL: $WEAVIATE_URL"
echo "WEAVIATE_API_KEY: $WEAVIATE_API_KEY"

# Start the Docker container for the Flask server with docker-compose
docker-compose run -d -p 5050:5050 execgpt

# Navigate to the Frontend directory
cd KRAGEN_Dashboard/Frontend

# Remove the existing node_modules folder if it exists to ensure a clean slate for npm install
if [ -d "node_modules" ]; then
    rm -rf node_modules
fi

# # Install NVM (Node Version Manager) to manage versions of node and npm
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash


# Check if .bashrc exists, and source it if it does
if [ -f "$HOME/.bashrc" ]; then
    source "$HOME/.bashrc"
else
    echo "$HOME/.bashrc does not exist. Creating a new one."
    touch "$HOME/.bashrc"
    # If you have default content for .bashrc, you can add it here before sourcing
    # echo "Default content" >> "$HOME/.bashrc"
    source "$HOME/.bashrc"
fi

# # Load NVM and its bash completion
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# # Install and use the specified version of Node.js using NVM
# nvm install 21.7.1
# nvm use 21.7.1

# Install npm dependencies and start the React application in the background
npm install
npm start &
REACT_PID=$!

# Define a function to clean up background processes on script exit
function cleanup_react() {
    echo "Exiting..."
    kill $REACT_PID
    exit
}

# Trap EXIT signal to ensure the cleanup function runs on script exit
trap cleanup_react EXIT

# Wait for the React process to finish before exiting the script
wait $REACT_PID
