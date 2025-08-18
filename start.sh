#!/bin/bash

echo "Starting POS System... This might take a moment."

# Navigate to the script's directory to ensure docker-compose works correctly
cd "$(dirname "$0")"

# Start the Docker containers in the background
docker compose up -d

echo "Waiting for application to launch..."
# Wait for 15-20 seconds to give the app time to build and start
sleep 20

echo "Opening application in your browser..."
# Open the URL in the default browser (works on Mac and most Linux desktops)
open http://localhost:3000

echo "System is running!"