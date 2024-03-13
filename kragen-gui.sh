#!/bin/bash

pip install -r ./KRAGEN_Dashboard/Backend/ExecGPTServer/requirements.txt



# Copy .env file and replace the value of the 11th line
cp ./KRAGEN_Dashboard/Backend/config.json.sample ./KRAGEN_Dashboard/Backend/config.json

openaikey=$(sed -n '11p' .env)
openaikey=$(echo $openaikey | cut -d'=' -f2)

weaviateurl=$(sed -n '15p' .env)
weaviateurl=$(echo $weaviateurl | cut -d'=' -f2)

weaviatekey=$(sed -n '16p' .env)
weaviatekey=$(echo $weaviatekey | cut -d'=' -f2)

text="\"api_key\": \"$openaikey\","
sed -i "28s/.*/$text/" ./KRAGEN_Dashboard/Backend/config.json

text="\"api_key\": \"$weaviatekey\","
sed -i "15s/.*/$text/" ./KRAGEN_Dashboard/Backend/config.json

text="\"url\": \"$weaviateurl\","
sed -i "16s/.*/$text/" ./KRAGEN_Dashboard/Backend/config.json

# Start Flask server in the background
cd ./KRAGEN_Dashboard/Backend
pip install -e graph_of_thoughts
flask --app ExecGPTServer init-db
python execgpt.py > flask_server.log 2>&1 &
FLASK_PID=$!

# Function to trap exit signals and kill subprocesses
function cleanup_flask() {
    echo "Exiting..."
    kill $FLASK_PID
    exit
}

# Trap exit signals
trap cleanup_flask EXIT

# Start React app in the background
cd ../Frontend
npm install
npm start &
REACT_PID=$!

# Function to trap exit signals and kill subprocesses
function cleanup_react() {
    echo "Exiting..."
    kill $REACT_PID
    exit
}

# Trap exit signals
trap cleanup_react EXIT

# Wait for both processes to finish
wait $FLASK_PID
wait $REACT_PID
