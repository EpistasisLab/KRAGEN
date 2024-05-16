#!/bin/sh

# Wait for execgpt to be available
until curl -s http://execgpt:5050 > /dev/null
do
  echo "Waiting for execgpt to start..."
  echo "---Check kragen-server logs for progress..."
  sleep 15
done

# Once execgpt is available, start the GUI
npm start
