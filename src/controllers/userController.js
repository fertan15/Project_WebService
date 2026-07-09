const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const getAllUsers = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const users = await db.collection("users").find({}).toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, username, email, wallet, subscription_status } = req.body;
    const db = mongoose.connection.db;

    const updateFields = {};
    if (role) updateFields.role = role;
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (wallet !== undefined) updateFields.wallet = Number(wallet);
    if (subscription_status) updateFields.subscription_status = subscription_status;

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const db = mongoose.connection.db;

    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser
};
