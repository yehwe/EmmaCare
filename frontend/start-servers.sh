#!/bin/bash

echo "🚀 Starting EmmaCare servers..."

# Check if Python virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install numpy scikit-learn joblib

# Start WebSocket server
echo "🌐 Starting WebSocket server..."
node emma-care-backend/websocket.js &
WS_PID=$!

# Start main backend server
echo "🔧 Starting main backend server..."
node emma-care-backend/server.js &
BACKEND_PID=$!

# Start serial reader
echo "📡 Starting serial reader..."
node emma-care-backend/serialReader.js &
SERIAL_PID=$!

echo "✅ All servers started!"
echo "📊 WebSocket: http://localhost:8080"
echo "🔧 Backend: http://localhost:3000"
echo "📱 Frontend: http://localhost:5173"

# Wait for user to stop
echo "Press Ctrl+C to stop all servers"
trap "echo '🛑 Stopping servers...'; kill $WS_PID $BACKEND_PID $SERIAL_PID; exit" INT
wait 