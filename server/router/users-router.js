const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  listContacts,
  createUser,
} = require("../controllers/users-controller");

// All routes require an authenticated user
router.use(authMiddleware);

// Public-to-authenticated contacts list (non-admin OK)
// GET /api/users/contacts
router.get("/contacts", listContacts);

// GET /api/users
router.get("/", listUsers);

// POST /api/users (admin only)
router.post("/", createUser);

// GET /api/users/:id
router.get("/:id", getUserById);

// PUT /api/users/:id
router.put("/:id", updateUser);

// DELETE /api/users/:id
router.delete("/:id", deleteUser);

module.exports = router;
