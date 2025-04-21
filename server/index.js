/**
 * Claims Hive Server
 * Main entry point for the server application
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const WebSocket = require('ws');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Import database connection
const db = require('./database/connection');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/company', require('./routes/company'));
app.use('/api/claim-type', require('./routes/claimType'));
// Additional routes will be added as we implement them
// app.use('/api/claim', require('./routes/claim'));

// Default route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  // Send a welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Claims Hive WebSocket server'
  }));

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received WebSocket message:', data);

      // Handle different message types
      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
        // Add more message handlers here
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection
  db.query('SELECT NOW()')
    .then(res => {
      console.log('Database connection successful. Server time:', res.rows[0].now);
    })
    .catch(err => {
      console.error('Database connection error:', err);
    });
});

// Handle server shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    db.pool.end();
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    db.pool.end();
  });
});
