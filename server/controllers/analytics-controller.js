const { getRange, incrementTotalMessages, setActiveUsers } = require("../services/analytics-service");

// GET /analytics?startDate=&endDate=
const getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await getRange(startDate, endDate);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// POST /analytics/message -> increments totalMessages (auth required)
const postMessageEvent = async (_req, res, next) => {
  try {
    const doc = await incrementTotalMessages();
    res.json({ ok: true, doc });
  } catch (err) {
    next(err);
  }
};

// POST /analytics/active { count } -> sets activeUsers (admin only)
const postActiveUsers = async (req, res, next) => {
  try {
    const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin");
    if (!isAdmin) return res.status(403).json({ message: "Forbidden" });

    const { count } = req.body;
    const num = Number(count);
    if (!Number.isFinite(num) || num < 0) {
      return res.status(400).json({ message: "count must be a non-negative number" });
    }
    const doc = await setActiveUsers(num);
    res.json({ ok: true, doc });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics, postMessageEvent, postActiveUsers };
