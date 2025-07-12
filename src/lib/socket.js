import { Server } from "socket.io";
import http from "http";
import express from "express";
import { LocalPath } from "../config.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [LocalPath, process.env.FRONTEND_URL]
        : [LocalPath],
    credentials: true,
  },
});

// Used to store online users and their sockets
const userSocketMap = {}; // { userId: Set(socketId) }

function getReceiverSocketIds(userId) {
  return userSocketMap[userId] ? Array.from(userSocketMap[userId]) : [];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId || socket.handshake.auth.userId;
  console.log("User ID from handshake:", userId, socket.id);

  if (userId) {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    for (const [uid, sockets] of Object.entries(userSocketMap)) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        delete userSocketMap[uid];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server, getReceiverSocketIds };
