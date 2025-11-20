const User = require("../models/user-model");

// Helper to shape API response fields
const sanitizeUser = (u) => {
  if (!u) return null;
  const obj = u.toObject ? u.toObject() : u;
  const { password, __v, ...rest } = obj;
  // expose `name` for API consistency while keeping existing `username`
  return {
    ...rest,
    name: obj.username,
    username: obj.username,
  };
};

// POST /users (admin only)
const createUser = async (req, res, next) => {
  try {
    const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin");
    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { name, username, email, password, role = "user", avatar } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const doc = await User.create({
      username: name || username || email.split("@")[0],
      email,
      password,
      role,
      avatar,
    });

    // remove password in response
    const out = await User.findById(doc._id).select("-password -__v");
    res.status(201).json(sanitizeUser(out));
  } catch (err) {
    next(err);
  }
};

// GET /users (admin only)
const listUsers = async (req, res, next) => {
  try {
    // if (!req.user || !(req.user.isAdmin || req.user.role === "admin")) {
    //   return res.status(403).json({ message: "Forbidden" });
    // }
    const users = await User.find({}).select("-password -__v");
    res.json(users.map(sanitizeUser));
  } catch (err) {
    next(err);
  }
};

// GET /users/:id (admin or self)
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isSelf = req.user && String(req.user._id) === String(id);
    const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin");
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const user = await User.findById(id).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
};

// PUT /users/:id (admin or self) - disallow password change here
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isSelf = req.user && String(req.user._id) === String(id);
    const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin");
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { name, username, email, avatar, role } = req.body;
    const updates = {};
    if (typeof name === "string") updates.username = name;
    if (typeof username === "string") updates.username = username; // support legacy field
    if (typeof email === "string") updates.email = email;
    if (typeof avatar === "string") {
      // If avatar is a data URL, upload to Cloudinary and save the secure URL
      if (avatar.startsWith('data:')) {
        try {
          const { cloudinary } = require("../utils/cloudinary");
          const uploadRes = await cloudinary.uploader.upload(avatar, {
            folder: "chatapp/avatars",
            overwrite: true,
            public_id: String(req.params.id || req.user?._id || 'unknown'),
            resource_type: "image",
          });
          updates.avatar = uploadRes.secure_url || uploadRes.url;
        } catch (e) {
          // Fallback: keep original string (could be a URL) if upload fails
          updates.avatar = avatar;
        }
      } else {
        // Already a URL
        updates.avatar = avatar;
      }
    }
    // Role changes: only admins can change role, except when there are no admins at all (bootstrap)
    if (typeof role === "string") {
      if (isAdmin) {
        updates.role = role;
      } else if (isSelf) {
        // escape hatch: allow self-promotion if there are no admins
        const adminCount = await User.countDocuments({ role: "admin" });
        if (adminCount === 0 && role === "admin") {
          updates.role = role;
        }
      }
    }

    // Never allow password change via this route
    if ("password" in req.body) {
      return res.status(400).json({ message: "Use auth endpoints to change password" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true, projection: { password: 0, __v: 0 } }
    );

    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(sanitizeUser(updated));
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:id (admin or self)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isSelf = req.user && String(req.user._id) === String(id);
    const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin");
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

// GET /users/contacts (authenticated) - minimal fields, excludes current user
const listContacts = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const me = String(req.user._id || req.user.id);
    const users = await User.find({ _id: { $ne: me } }).select("_id username email avatar role updatedAt createdAt");
    res.json(users.map(sanitizeUser));
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, getUserById, updateUser, deleteUser, listContacts, createUser };
