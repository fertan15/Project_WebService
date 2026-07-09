const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const getAllSubscriptions = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const plans = await db.collection("subscriptionplans").find({}).toArray();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscriptions", error: error.message });
  }
};

const createSubscription = async (req, res) => {
  try {
    const { plan_name, price, duration_days, description } = req.body;
    const db = mongoose.connection.db;

    if (!plan_name || price === undefined || !duration_days) {
      return res.status(400).json({ message: "plan_name, price, and duration_days are required" });
    }

    const result = await db.collection("subscriptionplans").insertOne({
      plan_name,
      price: Number(price),
      duration_days: Number(duration_days),
      description: description || "",
      createdAt: new Date()
    });

    res.status(201).json({ message: "Subscription plan created successfully", planId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: "Failed to create subscription plan", error: error.message });
  }
};

const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_name, price, duration_days, description } = req.body;
    const db = mongoose.connection.db;

    const updateFields = {};
    if (plan_name) updateFields.plan_name = plan_name;
    if (price !== undefined) updateFields.price = Number(price);
    if (duration_days !== undefined) updateFields.duration_days = Number(duration_days);
    if (description !== undefined) updateFields.description = description;

    const result = await db.collection("subscriptionplans").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    res.status(200).json({ message: "Subscription plan updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update subscription plan", error: error.message });
  }
};

const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const db = mongoose.connection.db;

    const result = await db.collection("subscriptionplans").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    res.status(200).json({ message: "Subscription plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete subscription plan", error: error.message });
  }
};

module.exports = {
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription
};
