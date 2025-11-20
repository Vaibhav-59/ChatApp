const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const { getAnalytics, postMessageEvent, postActiveUsers } = require("../controllers/analytics-controller");

// All routes require auth
router.use(authMiddleware);

// GET /api/analytics?startDate=&endDate= (admin only - enforced in controller)
router.get("/", getAnalytics);

// POST /api/analytics/message -> increments totalMessages (any authenticated)
router.post("/message", postMessageEvent);

// POST /api/analytics/active { count } (admin only - enforced in controller)
router.post("/active", postActiveUsers);

module.exports = router;
