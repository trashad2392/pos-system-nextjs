@echo off
echo Starting POS System... This might take a moment.

:: Change directory to the script's location
cd /d "%~dp0"

:: Start the Docker containers in the background
docker-compose up -d

echo Waiting for application to launch...
:: Wait for 15-20 seconds
timeout /t 20 > nul

echo Opening application in your browser...
:: Open the URL in the default browser
start http://localhost:3000

echo System is running!