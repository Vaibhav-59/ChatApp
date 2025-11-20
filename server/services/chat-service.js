const Message = require("../models/message-model");
const { incrementTotalMessages } = require("../services/analytics-service");

async function sendMessage({ from, to = null, content, image = null, clientTempId = null }) {
  if (!content && !image) {
    throw new Error("Message content or image is required");
  }

  // Use a deterministic DM room key so both directions (from->to and to->from)
  // are stored under the same roomId. For group/global we keep "global".
  const roomId = to
    ? (() => {
        const a = String(from);
        const b = String(to);
        const sorted = [a, b].sort();
        return `dm:${sorted[0]}:${sorted[1]}`;
      })()
    : "global";

  const messageData = {
    senderId: from,
    receiverId: to || null,
    roomId,
    text: content ? String(content).trim() : "",
    image: image || null
  };

  const doc = await Message.create(messageData);

  try {
    await incrementTotalMessages();
  } catch (_) {
    // ignore analytics errors
  }

  // Lazy load getIO to avoid circular dependency
  const { getIO } = require("../utils/socket");
  const io = getIO();
  const sanitized = sanitizeMessage(doc);
  if (clientTempId) sanitized.clientTempId = clientTempId;

  // Emit to receiver's room and sender's personal room
  if (to) {
    io.to(`user:${to}`).emit("message:new", sanitized);
    io.to(`user:${from}`).emit("message:new", sanitized);
  } else {
    // Global message
    io.to("global").emit("message:new", sanitized);
  }

  return doc;
}

async function markRead({ messageId, userId }) {
  const updated = await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { readBy: userId } },
    { new: true }
  );
  if (!updated) throw new Error("Message not found");

  // Lazy load getIO to avoid circular dependency
  const { getIO } = require("../utils/socket");
  const io = getIO();
  const room = updated.receiverId ? `user:${updated.receiverId}` : "global";
  io.to(room).emit("message:read", { messageId: updated._id, userId });

  return updated;
}

function sanitizeMessage(m) {
  const obj = m.toObject ? m.toObject() : m;
  return {
    _id: obj._id,
    senderId: obj.senderId,
    from: obj.senderId, // keep for backward compat
    receiverId: obj.receiverId,
    to: obj.receiverId, // keep for backward compat
    roomId: obj.roomId,
    text: obj.text,
    image: obj.image,
    readBy: obj.readBy || [],
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

module.exports = { sendMessage, markRead };
