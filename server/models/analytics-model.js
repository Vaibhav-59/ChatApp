const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      default: () => new Date().setUTCHours(0, 0, 0, 0), // Start of day
    },
    totalUsers: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Only define the index once
analyticsSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model("Analytics", analyticsSchema);
