const mongoose = require("mongoose");
const { toObjectId } = require("../utils/objectId");

const getAllSubscriptions = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const plans = await db
      .collection("subscriptionplans")
      .find({})
      .sort({ price: 1 })
      .toArray();

    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscriptions", error: error.message });
  }
};

const getSubscriptionById = async (req, res) => {
  try {
    const planObjectId = toObjectId(req.params.id);
    if (!planObjectId) {
      return res.status(400).json({ message: "Invalid subscription plan id" });
    }

    const db = mongoose.connection.db;
    const plan = await db.collection("subscriptionplans").findOne({ _id: planObjectId });

    if (!plan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscription plan", error: error.message });
  }
};

const createSubscription = async (req, res) => {
  try {
    const { plan_name, price, duration_days, description } = req.body;
    const db = mongoose.connection.db;

    const result = await db.collection("subscriptionplans").insertOne({
      plan_name,
      price: Number(price),
      duration_days: Number(duration_days),
      description: description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newPlan = await db.collection("subscriptionplans").findOne({ _id: result.insertedId });

    res.status(201).json({
      message: "Subscription plan created successfully",
      data: newPlan,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create subscription plan", error: error.message });
  }
};

const updateSubscription = async (req, res) => {
  try {
    const planObjectId = toObjectId(req.params.id);
    if (!planObjectId) {
      return res.status(400).json({ message: "Invalid subscription plan id" });
    }

    const { plan_name, price, duration_days, description } = req.body;
    const updateFields = { updatedAt: new Date() };

    if (plan_name !== undefined) updateFields.plan_name = plan_name;
    if (price !== undefined) updateFields.price = Number(price);
    if (duration_days !== undefined) updateFields.duration_days = Number(duration_days);
    if (description !== undefined) updateFields.description = description;

    const db = mongoose.connection.db;
    const result = await db.collection("subscriptionplans").findOneAndUpdate(
      { _id: planObjectId },
      { $set: updateFields },
      { returnDocument: "after" },
    );

    if (!result) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    res.status(200).json({
      message: "Subscription plan updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update subscription plan", error: error.message });
  }
};

const deleteSubscription = async (req, res) => {
  try {
    const planObjectId = toObjectId(req.params.id);
    if (!planObjectId) {
      return res.status(400).json({ message: "Invalid subscription plan id" });
    }

    const db = mongoose.connection.db;
    const result = await db.collection("subscriptionplans").deleteOne({ _id: planObjectId });

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
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
