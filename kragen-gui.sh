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
cd ./KRAGEN_Dashboard/Backend

IMAGE_NAME="kragen-flask-server"
# Check if the Docker image already exists
if docker images "$IMAGE_NAME" | grep -q "$IMAGE_NAME"; then
    echo "Docker image $IMAGE_NAME already exists. Skipping build."
else
    echo "Docker image $IMAGE_NAME does not exist. Building..."
    docker build -t "$IMAGE_NAME" .
fi

# Function to install jq based on the OS
install_jq() {
    # Get OS details
    os_name="$(uname -s)"

    case "${os_name}" in
        Linux*)     
            # Assuming Debian-based Linux if Linux
            sudo apt-get update && sudo apt-get install -y jq
            ;;
        Darwin*)    
            # macOS
            brew install jq
            ;;
        *)          
            # Unsupported OS
            echo "Unsupported operating system for this script: ${os_name}"
            exit 1
            ;;
    esac
}

# Check if jq is installed, if not, install it
if ! type "jq" > /dev/null; then
  install_jq
fi

# Read configuration values from config.json
MODEL_ID=$(jq -r '.chatgpt.model_id' config.json)
PROMPT_TOKEN_COST=$(jq -r '.chatgpt.prompt_token_cost' config.json)
RESPONSE_TOKEN_COST=$(jq -r '.chatgpt.response_token_cost' config.json)
TEMPERATURE=$(jq -r '.chatgpt.temperature' config.json)
MAX_TOKENS=$(jq -r '.chatgpt.max_tokens' config.json)
STOP=$(jq -r '.chatgpt.stop' config.json)
ORGANIZATION=$(jq -r '.chatgpt.organization' config.json)
# API_KEY=$(jq -r '.chatgpt.api_key' config.json)
export $(grep OPENAI_API_KEY .env | xargs)
API_KEY=$OPENAI_API_KEY
EMBEDDING_ID=$(jq -r '.chatgpt.embedding_id' config.json)
# WEAVIATE_URL=$(jq -r '.weaviate.url' config.json)
export $(grep WEAVIATE_URL .env | xargs)
WEAVIATE_URL=$WEAVIATE_URL
# WEAVIATE_API_KEY=$(jq -r '.weaviate.api_key' config.json)
export $(grep WEAVIATE_API_KEY .env | xargs)
WEAVIATE_API_KEY=$WEAVIATE_API_KEY
WEAVIATE_DB=$(jq -r '.weaviate.db' config.json)
WEAVIATE_LIMIT=$(jq -r '.weaviate.limit' config.json)

# show API_KEY
echo "API_KEY: $API_KEY"

# show WEAVIATE_URL
echo "WEAVIATE_URL: $WEAVIATE_URL"

# show WEAVIATE_API_KEY
echo "WEAVIATE_API_KEY: $WEAVIATE_API"

# docker run -d -p 5050:5050 "$IMAGE_NAME"
# Run the Docker container with the environment variables
docker run -d -p 5050:5050 \
  -e MODEL_ID="$MODEL_ID" \
  -e PROMPT_TOKEN_COST="$PROMPT_TOKEN_COST" \
  -e RESPONSE_TOKEN_COST="$RESPONSE_TOKEN_COST" \
  -e TEMPERATURE="$TEMPERATURE" \
  -e MAX_TOKENS="$MAX_TOKENS" \
  -e STOP="$STOP" \
  -e ORGANIZATION="$ORGANIZATION" \
  -e API_KEY="$API_KEY" \
  -e EMBEDDING_ID="$EMBEDDING_ID" \
    -e WEAVIATE_URL="$WEAVIATE_URL" \
    -e WEAVIATE_API_KEY="$WEAVIATE_API_KEY" \
    -e WEAVIATE_DB="$WEAVIATE_DB" \
    -e WEAVIATE_LIMIT="$WEAVIATE_LIMIT" \
  "$IMAGE_NAME"

# Start React app in the background
cd ../Frontend

cp .env.sample .env

npm install
npm start &
REACT_PID=$!

# Function to trap exit signals and kill subprocessesN
function cleanup_react() {
    echo "Exiting..."
    kill $REACT_PID
    exit
}

# Trap exit signals
trap cleanup_react EXIT

# Wait for both processes to finish
wait $REACT_PID
