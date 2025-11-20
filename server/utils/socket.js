const jwt = require("jsonwebtoken");
const { setActiveUsers } = require("../services/analytics-service");
const { sendMessage, markRead } = require("../services/chat-service");

let ioInstance = null;

function setIO(io) {
  ioInstance = io;
  wireGateway(io);
  return io;
}

function getIO() {
  if (!ioInstance) throw new Error("Socket.io not initialized yet");
  return ioInstance;
}

module.exports = {
  setIO,
  getIO
};

function wireGateway(io) {
  const onlineUsers = new Map(); // socketId -> userId

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!token) {
      console.warn('[socket] No token provided in handshake auth or headers');
      return next(new Error("Unauthorized"));
    }

    const raw = typeof token === 'string' && token.startsWith("Bearer ") ? token.slice(7) : token;
    try {
      const payload = jwt.verify(raw, process.env.JWT_SECRET_KEY);
      socket.user = { id: payload.userId, email: payload.email };
      // attach basic user info for connection logs
      socket.handshake._user = socket.user;
      next();
    } catch (e) {
      console.error('[socket] JWT verification failed:', e.message);
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket?.user?.id;
    console.log(`[socket] connection attempt - socketId=${socket.id} userId=${userId}`);
    onlineUsers.set(socket.id, userId);

    // Join rooms
    socket.join("global");
    socket.join(`user:${userId}`);

    // Presence
    emitPresence(io, onlineUsers);

    socket.on("typing:start", ({ to = null }) => {
      const room = to ? `user:${to}` : "global";
      socket.to(room).emit("typing:start", { from: userId, room });
    });

    socket.on("typing:stop", ({ to = null }) => {
      const room = to ? `user:${to}` : "global";
      socket.to(room).emit("typing:stop", { from: userId, room });
    });

    socket.on("message:send", async ({ to = null, content, image = null, clientTempId = null }) => {
      try {
        const doc = await sendMessage({ from: userId, to, content, image, clientTempId });
        // broadcasts are done inside sendMessage
      } catch (e) {
        socket.emit("error", { message: e.message || "Failed to send message" });
      }
    });

    socket.on("message:read", async ({ messageId }) => {
      try {
        await markRead({ messageId, userId });
      } catch (e) {
        socket.emit("error", { message: e.message || "Failed to mark read" });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      emitPresence(io, onlineUsers);
    });
  });
}

function emitPresence(io, onlineUsers) {
  const uniqueUsers = new Set(onlineUsers.values());
  const count = uniqueUsers.size;
  io.emit("presence:update", { online: count });
  // Also emit list of online userIds for richer client presence
  io.emit("presence:list", { users: Array.from(uniqueUsers) });
  // Best-effort update to analytics active users
  setActiveUsers(count).catch(() => { });
}
