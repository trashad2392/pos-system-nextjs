#!/bin/bash
echo "Starting POS System..."
docker compose up -d
echo ""
echo "System is starting up in the background."
echo "Please wait about a minute, then open your web browser and go to:"
echo "http://localhost:3000"