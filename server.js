// server.js

const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

// Store clients and their usernames
const clients = new Map();

// Broadcast function to all clients except the sender
const broadcast = (message, sender) => {
    clients.forEach((ws, username) => {
        if (username !== sender && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
};

server.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // When a user joins, store their username
        if (data.type === 'join') {
            clients.set(data.username, ws);
            ws.username = data.username; // Attach username to the WebSocket
            console.log(`${data.username} joined the chat.`);
        }

        // Handle chat messages
        else if (data.type === 'chat') {
            const sender = data.username;
            const messageContent = data.content;

            if (data.recipient) {
                // Send a private message
                const recipientWs = clients.get(data.recipient);
                if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                    recipientWs.send(JSON.stringify({ type: 'chat', username: sender, content: messageContent, private: true }));
                }
            } else {
                // Broadcast message to all
                broadcast(JSON.stringify({ type: 'chat', username: sender, content: messageContent }), sender);
            }
        }
    });

    // Clean up when client disconnects
    ws.on('close', () => {
        clients.delete(ws.username);
        console.log(`${ws.username} left the chat.`);
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
