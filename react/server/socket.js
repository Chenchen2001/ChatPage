const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const cors = require("cors");
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // For demo only (restrict in production)
  },
});

// Store room data { roomName: { users: [socketIds], messages: [] } }
const rooms = {};

io.on("connection", (socket) => {
  let currentRoom = null;
  let username = null;

  // Join room
  socket.on("join-room", ({ room, name }) => {
    username = name;
    currentRoom = room;

    // init room
    if (!rooms[room]) {
      rooms[room] = { users: [], messages: [] };
    }

    // check if name exists
    const userExists = rooms[room].users.some((user) => user.id === socket.id);

    if (!userExists) {
      rooms[room].users.push({ id: socket.id, name });
      socket.join(room);

      // send updated room data to all
      io.to(room).emit("room-data", {
        users: rooms[room].users.map((u) => u.name),
        messages: rooms[room].messages,
      });

      // send join info
      socket.broadcast.to(room).emit("user-joined", name);
    }
  });

  // Handle messages
  socket.on("send-message", (message) => {
    if (!currentRoom) return;

    const msgData = {
      sender: username,
      text: message,
      time: new Date().toLocaleTimeString(),
    };

    // Store message (optional)
    rooms[currentRoom].messages.push(msgData);

    // Broadcast to room
    io.to(currentRoom).emit("new-message", msgData);
  });

  function leave(){
    if (currentRoom && rooms[currentRoom]) {
      // Search for disconnected user
      const leavingUser = rooms[currentRoom].users.find(
        (user) => user.id === socket.id
      );

      if (leavingUser) {
        // remove user
        rooms[currentRoom].users = rooms[currentRoom].users.filter(
          (user) => user.id !== socket.id
        );

        // broadcast to others in the room
        io.to(currentRoom).emit("user-left", leavingUser.name);

        // send updated user
        io.to(currentRoom).emit("room-data", {
          users: rooms[currentRoom].users.map((u) => u.name),
          messages: rooms[currentRoom].messages,
        });

        // clear empty rooms
        if (rooms[currentRoom].users.length === 0) {
          delete rooms[currentRoom];
        }
      }
    }
  }

  // deal with disconnect
  socket.on("disconnect", () => {
    leave()
  });

  socket.on("leave-room", () => {
    leave()
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
