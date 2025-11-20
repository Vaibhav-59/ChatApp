const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const { getMessages } = require("../controllers/message-controller");

// All routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/messages/:roomId
 * @description Get paginated messages for a room
 * @query page - Page number (default: 1)
 * @query limit - Messages per page (default: 20, max: 50)
 * @returns {Object} Messages with pagination info
 */
router.get("/:roomId", getMessages);

module.exports = router;
