#!/bin/bash

echo "Starting Claims Hive on port 5000..."
docker-compose up -d

echo ""
echo "Claims Hive is now running!"
echo "Open your browser and navigate to: http://localhost:5000"
echo ""
echo "To stop the server, run: ./stop.sh"
