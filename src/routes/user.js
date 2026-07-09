const express = require("express");
const router = express.Router();
const { getAllUsers, updateUser, deleteUser } = require("../controllers/userController");
const { authenticate, authorize, validate } = require("../middlewares");
const { updateUserSchema } = require("../Schema/userSchema");

// CRUD for users (typically Admin only)
router.get("/", authenticate, authorize(["admin"]), getAllUsers);
router.put("/:id", authenticate, authorize(["admin"]), validate(updateUserSchema), updateUser);
router.delete("/:id", authenticate, authorize(["admin"]), deleteUser);

module.exports = router;
