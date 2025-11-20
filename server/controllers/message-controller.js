const Message = require("../models/message-model");

// GET /messages/:roomId?page=1&limit=20
const getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    const [messages, total] = await Promise.all([
      Message.find({ roomId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'username email avatar name')
        .populate('receiverId', 'username email avatar name')
        .populate('readBy', 'username')
        .lean(),
      Message.countDocuments({ roomId })
    ]);

    // Mark messages as read by current user
    if (messages.length > 0 && req.user?.id) {
      const unread = messages
        .filter(msg => !msg.readBy?.includes(req.user.id))
        .map(msg => msg._id);

      if (unread.length > 0) {
        await Message.updateMany(
          { _id: { $in: unread } },
          { $addToSet: { readBy: req.user.id } }
        );
      }
    }

    res.json({
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMessages };
