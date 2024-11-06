// app.js

// Prompt for username on joining
const username = prompt("Enter your username:");

// Establish WebSocket connection
const ws = new WebSocket('wss://puzzling-wistful-paw.glitch.me');

// Join message sent to the server
ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join', username }));
};

// Send message function with optional recipient
const sendMessage = (message, recipient = null) => {
    if (message.trim() !== '') {
        const fullMessage = JSON.stringify({
            type: 'chat',
            username,
            content: message,
            recipient // Specify recipient for private messages, or null for broadcast
        });
        ws.send(fullMessage);

        // Display locally if it's a private message
        if (recipient) {
            displayMessage(`(To ${recipient}) ${username}: ${message}`, 'self');
        } else {
            displayMessage(`${username}: ${message}`, 'self');
        }

        document.getElementById('message-input').value = '';
    }
};

// Display received messages
const displayMessage = (message, sender = 'other') => {
    const chatWindow = document.getElementById('chat-window');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
};

// Handle incoming WebSocket messages
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const messageText = data.private ? `(Private) ${data.username}: ${data.content}` : `${data.username}: ${data.content}`;
    displayMessage(messageText, 'other');
};

// Event listeners for sending messages
document.getElementById('message-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const recipient = document.getElementById('recipient-input').value.trim(); // Optional recipient input
        sendMessage(e.target.value, recipient || null);
    }
});

document.getElementById('send-button').addEventListener('click', () => {
    const input = document.getElementById('message-input');
    const recipient = document.getElementById('recipient-input').value.trim();
    sendMessage(input.value, recipient || null);
});
