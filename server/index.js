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

// Log ALL incoming requests VERY early
app.use((req, res, next) => {
  console.log(`>>> Incoming Request: ${req.method} ${req.originalUrl} - Headers:`, JSON.stringify(req.headers));
  next(); // Pass control to the next middleware
});

// Import database connection
const db = require('./database/connection');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes - Define API routes before static files to ensure they take precedence
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/company', require('./routes/company'));
app.use('/api/claim-type', require('./routes/claimType'));
// Additional routes will be added as we implement them
// app.use('/api/claim', require('./routes/claim'));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Default route for SPA - Handles client-side routing
app.get('*', (req, res, next) => { // Added 'next' just in case, though likely not needed here
  console.log(`[Catch-All] Request received: ${req.method} ${req.originalUrl}`);
  
  // Check if it looks like an API request path
  if (req.path.startsWith('/api/')) {
    console.log(`[Catch-All] API path detected (${req.path}). Sending 404 JSON.`);
    // If an API path somehow reached here, it's a 404
    return res.status(404).json({ message: `API endpoint not found: ${req.method} ${req.path}` });
  }
  
  // Check if the request explicitly does NOT accept HTML
  // If it's not an API path but doesn't want HTML, treat as 404
  // Note: This might interfere with non-browser API clients that don't set Accept header correctly.
  // Consider removing this check if it causes issues for valid API clients.
  if (!req.accepts('html')) {
     console.log(`[Catch-All] Non-HTML request detected (${req.path}, Accepts: ${req.headers.accept}). Sending 404 JSON.`);
     return res.status(404).json({ message: 'Resource not found or invalid format requested' });
  }

  // Otherwise, serve the index.html for SPA routing
  console.log(`[Catch-All] Serving index.html for ${req.path}`);
  res.sendFile(path.join(__dirname, '..', 'index.html'), (err) => {
    if (err) {
      console.error("[Catch-All] Error sending index.html:", err);
      // Pass error to default Express error handler if sendFile fails
      next(err); 
    }
  });
});

// Remove the simple 404 handler as the catch-all now handles it
// app.use((req, res, next) => {
//   console.log(`[Final 404] Unhandled route: ${req.method} ${req.originalUrl}`);
//   res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
// });

// Create HTTP server (ensure this is only declared once)
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Keep track of all connected clients
const clients = new Set();

// Broadcast to all clients including sender
function broadcast(data, sender) {
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  console.log('Broadcasting message:', message);
  console.log('Number of connected clients:', clients.size);
  console.log('Sender client ID:', sender ? sender.clientId : 'unknown');
  
  let sentCount = 0;
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      console.log(`Sending message to client ${client === sender ? '(SENDER)' : ''}`);
      client.send(message);
      sentCount++;
    }
  });
  
  console.log(`Message sent to ${sentCount} clients`);
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // Add client to the set
  clients.add(ws);
  
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
        case 'update':
        case 'add':
        case 'delete':
          // Broadcast the message to all clients (including the sender)
          broadcast(data, ws);
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
    // Remove client from the set
    clients.delete(ws);
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
