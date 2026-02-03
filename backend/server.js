const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();

/* ---------- CORS FIX (IMPORTANT) ---------- */
app.use(cors({
  origin: "*",              // allow all origins (for ngrok/testing)
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

// test route
app.get('/', (req, res) => {
  res.send("Backend is running");
});

// Connect to database
connectDB();

// routes
app.use('/api/auth', require('./routes/authRoutes'));

// server
const server = http.createServer(app);

// socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});

// store online users
const users = {};

io.on('connection', (socket) => {
  console.log("SOCKET CONNECTED FROM:", socket.handshake.address);

  // when user comes online
  socket.on("join", (userId) => {
    users[userId] = socket.id;
    io.emit("online-users", Object.keys(users));
  });

  // when user calls someone
  socket.on("call-user", ({ to, from, offer }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("incoming-call", { from, offer });
    }
  });

  // when one user answers
  socket.on("answer-call", ({ to, answer }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-answered", { answer });
    }
  });

  // ICE candidates
  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", { candidate });
    }
  });

  // 🔴 END CALL FEATURE
  socket.on("end-call", ({ to }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-ended");
    }
  });

  // when user disconnects
  socket.on("disconnect", () => {
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
      }
    }
    io.emit("online-users", Object.keys(users));
  });
});

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
