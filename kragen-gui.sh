#!/bin/bash

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

# Start Flask server in Docker container
cd ./KRAGEN_Dashboard/Backend
docker build -t kragen-flask-server .
docker run -d -p 5050:5050 kragen-flask-server 

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
wait $FLASK_PID
wait $REACT_PID
