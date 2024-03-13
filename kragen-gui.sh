#!/bin/bash

pip install -r ./KRAGEN_Dashboard/Backend/ExecGPTServer/requirements.txt

# Function to trap exit signals and kill subprocesses
function cleanup() {
    echo "Exiting..."
    kill $(jobs -p)
    exit
}

# Trap exit signals
trap cleanup EXIT

# Start Flask server in the background
cd ./KRAGEN_Dashboard/Backend
pip install -e graph_of_thoughts
flask --app ExecGPTServer init-db
python execgpt.py &
FLASK_PID=$!

# Start React app in the background
cd ../Frontend
npm install
npm start &
REACT_PID=$!

# Wait for both processes to finish
wait $FLASK_PID
wait $REACT_PID
