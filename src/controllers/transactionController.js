const mongoose = require("mongoose");
const { toObjectId } = require("../utils/objectId");

const calculatePremiumUntil = (user, durationDays) => {
  const now = new Date();
  const currentPremiumUntil = user?.premium_until ? new Date(user.premium_until) : null;
  const startFrom = currentPremiumUntil && currentPremiumUntil > now ? currentPremiumUntil : now;

  return new Date(startFrom.getTime() + Number(durationDays) * 24 * 60 * 60 * 1000);
};

const activateSubscription = async (db, userObjectId, plan, session) => {
  const user = await db.collection("users").findOne({ _id: userObjectId }, { session });
  if (!user) {
    throw new Error("User not found");
  }

  const premiumUntil = calculatePremiumUntil(user, plan.duration_days);

  await db.collection("users").updateOne(
    { _id: userObjectId },
    {
      $set: {
        subscription_status: "premium",
        premium_until: premiumUntil,
        updatedAt: new Date(),
      },
    },
    { session },
  );

  return premiumUntil;
};

// Purchase subscription plan. Wallet payments are completed directly.
// Other payment methods are stored as Pending so admin can confirm them later.
const createTransaction = async (req, res) => {
  const { planId, paymentMethod } = req.body;
  const userObjectId = toObjectId(req.user.id);
  const planObjectId = toObjectId(planId);

  if (!userObjectId || !planObjectId) {
    return res.status(400).json({ message: "Invalid user id or plan id" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const db = mongoose.connection.db;

    const plan = await db.collection("subscriptionplans").findOne({ _id: planObjectId }, { session });
    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    const user = await db.collection("users").findOne({ _id: userObjectId }, { session });
    if (!user) {
      throw new Error("User not found");
    }

    const price = Number(plan.price);
    let status = "Pending";
    let remainingWallet = user.wallet;
    let premiumUntil = null;

    if (paymentMethod === "Wallet") {
      if (Number(user.wallet) < price) {
        throw new Error("Insufficient wallet balance");
      }

      await db.collection("users").updateOne(
        { _id: userObjectId },
        { $inc: { wallet: -price }, $set: { updatedAt: new Date() } },
        { session },
      );

      remainingWallet = Number(user.wallet) - price;
      premiumUntil = await activateSubscription(db, userObjectId, plan, session);
      status = "Success";
    }

    const invoiceResult = await db.collection("invoices").insertOne(
      {
        user_id: userObjectId,
        plan_id: planObjectId,
        invoice_date: new Date(),
        total_amount: price,
        payment_method: paymentMethod,
        status,
        premium_until_after_success: premiumUntil,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { session },
    );

    await session.commitTransaction();

    res.status(201).json({
      message: status === "Success" ? "Subscription purchased successfully" : "Transaction created and waiting for payment confirmation",
      transactionId: invoiceResult.insertedId,
      planBought: plan.plan_name,
      totalPaid: price,
      paymentMethod,
      status,
      premiumUntil,
      remainingWallet,
    });
  } catch (error) {
    await session.abortTransaction();
    const statusCode = error.message.includes("Insufficient") || error.message.includes("not found") ? 400 : 500;
    res.status(statusCode).json({ message: "Transaction failed", error: error.message });
  } finally {
    session.endSession();
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userObjectId = toObjectId(req.user.id);
    if (!userObjectId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const db = mongoose.connection.db;
    const fullHistory = await db.collection("invoices").aggregate([
      { $match: { user_id: userObjectId } },
      {
        $lookup: {
          from: "subscriptionplans",
          localField: "plan_id",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    res.status(200).json(fullHistory);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transaction history", error: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const transactions = await db.collection("invoices").aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "subscriptionplans",
          localField: "plan_id",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "user.password": 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  const transactionObjectId = toObjectId(req.params.id);
  if (!transactionObjectId) {
    return res.status(400).json({ message: "Invalid transaction id" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status, payment_method } = req.body;
    const db = mongoose.connection.db;

    const existingTransaction = await db.collection("invoices").findOne(
      { _id: transactionObjectId },
      { session },
    );

    if (!existingTransaction) {
      throw new Error("Transaction not found");
    }

    const updateFields = { updatedAt: new Date() };
    if (status !== undefined) updateFields.status = status;
    if (payment_method !== undefined) updateFields.payment_method = payment_method;

    let premiumUntil = existingTransaction.premium_until_after_success || null;

    if (status === "Success" && existingTransaction.status !== "Success") {
      const plan = await db.collection("subscriptionplans").findOne(
        { _id: existingTransaction.plan_id },
        { session },
      );

      if (!plan) {
        throw new Error("Subscription plan not found");
      }

      premiumUntil = await activateSubscription(db, existingTransaction.user_id, plan, session);
      updateFields.premium_until_after_success = premiumUntil;
    }

    const updatedTransaction = await db.collection("invoices").findOneAndUpdate(
      { _id: transactionObjectId },
      { $set: updateFields },
      { returnDocument: "after", session },
    );

    await session.commitTransaction();

    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction,
      premiumUntil,
    });
  } catch (error) {
    await session.abortTransaction();
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({ message: "Failed to update transaction", error: error.message });
  } finally {
    session.endSession();
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transactionObjectId = toObjectId(req.params.id);
    if (!transactionObjectId) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }

    const db = mongoose.connection.db;
    const result = await db.collection("invoices").deleteOne({ _id: transactionObjectId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete transaction", error: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactionHistory,
  getAllTransactions,
  updateTransaction,
  deleteTransaction,
};
