const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const cors = require('cors');
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*" // For demo only (restrict in production)
  }
});

// Store room data { roomName: { users: [socketIds], messages: [] } }
const rooms = {};

io.on('connection', (socket) => {
  let currentRoom = null;
  let username = null;

  // Join room with username
  socket.on('join-room', ({ room, name }) => {
    username = name;
    currentRoom = room;
    
    // Initialize room if doesn't exist
    if (!rooms[room]) {
      rooms[room] = { users: [], messages: [] };
    }
    
    // Add user to room
    rooms[room].users.push({ id: socket.id, name });
    socket.join(room);
    
    // Notify room
    io.to(room).emit('user-joined', name);
    
    // Send room info to new user
    socket.emit('room-data', {
      users: rooms[room].users.map(u => u.name),
      messages: rooms[room].messages
    });
  });

  // Handle messages
  socket.on('send-message', (message) => {
    if (!currentRoom) return;
    
    const msgData = {
      sender: username,
      text: message,
      time: new Date().toLocaleTimeString()
    };
    
    // Store message (optional)
    rooms[currentRoom].messages.push(msgData);
    
    // Broadcast to room
    io.to(currentRoom).emit('new-message', msgData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      // Remove user from room
      rooms[currentRoom].users = rooms[currentRoom].users.filter(
        user => user.id !== socket.id
      );
      
      // Notify room
      io.to(currentRoom).emit('user-left', username);
      
      // Clean up empty rooms
      if (rooms[currentRoom].users.length === 0) {
        delete rooms[currentRoom];
      }
    }
  });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});