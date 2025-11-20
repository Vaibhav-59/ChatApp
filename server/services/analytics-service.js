const Analytics = require("../models/analytics-model");

function startOfUtcDay(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return d;
}

async function upsertToday(patch = {}) {
  const today = startOfUtcDay();
  const doc = await Analytics.findOneAndUpdate(
    { date: today },
    { $setOnInsert: { date: today }, $inc: patch.inc || {}, $set: patch.set || {} },
    { new: true, upsert: true }
  );
  return doc;
}

async function emitUpdate(doc) {
  try {
    // Lazy load getIO to avoid circular dependency
    const { getIO } = require("../utils/socket");
    const io = getIO();
    io.emit("analytics:update", doc);
  } catch (_) {
    // socket not ready yet -> ignore
  }
}

async function incrementTotalUsers() {
  const doc = await upsertToday({ inc: { totalUsers: 1 } });
  await emitUpdate(doc);
  return doc;
}

async function incrementTotalMessages() {
  const doc = await upsertToday({ inc: { totalMessages: 1 } });
  await emitUpdate(doc);
  return doc;
}

async function setActiveUsers(count) {
  const doc = await upsertToday({ set: { activeUsers: count } });
  await emitUpdate(doc);
  return doc;
}

async function getRange(startDate, endDate) {
  const query = {};
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startOfUtcDay(new Date(startDate));
    if (endDate) query.date.$lte = startOfUtcDay(new Date(endDate));
  }
  const items = await Analytics.find(query).sort({ date: 1 });
  return items;
}

module.exports = {
  incrementTotalUsers,
  incrementTotalMessages,
  setActiveUsers,
  getRange,
};
