const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

// Pay-Per-Use Model -> Subscription Plan via Wallet
const createTransaction = async (req, res) => {
  // Menggunakan Mongoose Session untuk ACID Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { planId, paymentMethod } = req.body;
    const userId = req.user.id;
    const db = mongoose.connection.db;

    // 1. Dapatkan detail plan
    const plan = await db.collection("subscriptionplans").findOne({ _id: new ObjectId(planId) }, { session });
    if (!plan) {
      throw new Error("Subscription plan not found");
    }
    const price = plan.price;

    // 2. Dapatkan user dan check wallet
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) }, { session });
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.wallet < price) {
      throw new Error("Insufficient wallet balance");
    }

    // 3. Potong saldo wallet user & update subscription status
    const premiumUntil = new Date();
    premiumUntil.setDate(premiumUntil.getDate() + plan.duration_days);

    await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { 
        $inc: { wallet: -price },
        $set: { 
          subscription_status: "premium",
          premium_until: premiumUntil
        }
      },
      { session }
    );

    // 4. Create Invoice (Combined Header and Details)
    const invoiceResult = await db.collection("invoices").insertOne(
      {
        user_id: new ObjectId(userId),
        plan_id: new ObjectId(planId),
        invoice_date: new Date(),
        total_amount: price,
        payment_method: paymentMethod,
        status: "Success",
        createdAt: new Date()
      },
      { session }
    );

    const invoiceId = invoiceResult.insertedId;

    // Commit semua aksi database jika berhasil
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Subscription purchased successfully",
      transactionId: invoiceId,
      planBought: plan.plan_name,
      totalPaid: price,
      remainingWallet: user.wallet - price
    });
  } catch (error) {
    // Batalkan semua query jika terjadi error di tengah jalan
    await session.abortTransaction();
    session.endSession();
    const status = error.message.includes("Insufficient") || error.message.includes("not found") ? 400 : 500;
    res
      .status(status)
      .json({ message: "Transaction failed", error: error.message });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    // Ambil Invoice milik user saat ini dan populate data plan (melalui $lookup)
    const fullHistory = await db.collection("invoices").aggregate([
      { $match: { user_id: new ObjectId(req.user.id) } },
      {
        $lookup: {
          from: "subscriptionplans",
          localField: "plan_id",
          foreignField: "_id",
          as: "plan"
        }
      },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } }
    ]).toArray();

    res.status(200).json(fullHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const transactions = await db.collection("invoices").find({}).toArray();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method } = req.body;
    const db = mongoose.connection.db;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (payment_method) updateFields.payment_method = payment_method;

    const result = await db.collection("invoices").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update transaction", error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const db = mongoose.connection.db;

    const result = await db.collection("invoices").deleteOne({ _id: new ObjectId(id) });

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
  deleteTransaction
};
