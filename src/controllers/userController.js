const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { toObjectId } = require("../utils/objectId");

const publicUserProjection = {
  password: 0,
};

const getAllUsers = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const users = await db
      .collection("users")
      .find({}, { projection: publicUserProjection })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userObjectId = toObjectId(req.params.id);
    if (!userObjectId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const db = mongoose.connection.db;
    const user = await db.collection("users").findOne(
      { _id: userObjectId },
      { projection: publicUserProjection },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userObjectId = toObjectId(req.params.id);
    if (!userObjectId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const { role, username, email, wallet, subscription_status, premium_until, password } = req.body;
    const db = mongoose.connection.db;

    const updateFields = { updatedAt: new Date() };
    if (role !== undefined) updateFields.role = role;
    if (username !== undefined) updateFields.username = username;
    if (wallet !== undefined) updateFields.wallet = Number(wallet);
    if (subscription_status !== undefined) updateFields.subscription_status = subscription_status;
    if (premium_until !== undefined) updateFields.premium_until = premium_until ? new Date(premium_until) : null;
    if (password !== undefined) updateFields.password = await bcrypt.hash(password, 10);

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase();
      const existingEmail = await db.collection("users").findOne({
        email: normalizedEmail,
        _id: { $ne: userObjectId },
      });

      if (existingEmail) {
        return res.status(400).json({ message: "Email already used by another user" });
      }

      updateFields.email = normalizedEmail;
    }

    const result = await db.collection("users").findOneAndUpdate(
      { _id: userObjectId },
      { $set: updateFields },
      {
        returnDocument: "after",
        projection: publicUserProjection,
      },
    );

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", data: result });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userObjectId = toObjectId(req.params.id);
    if (!userObjectId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const db = mongoose.connection.db;
    const result = await db.collection("users").deleteOne({ _id: userObjectId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await db.collection("reviews").deleteMany({ user_id: userObjectId });
    await db.collection("watchlists").deleteMany({ user_id: userObjectId });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
