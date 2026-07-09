const express = require("express");
const router = express.Router();
const { 
  createTransaction, 
  getTransactionHistory,
  getAllTransactions,
  updateTransaction,
  deleteTransaction
} = require("../controllers/transactionController");
const { authenticate, authorize, validate } = require("../middlewares");
const { purchaseSchema, updateTransactionSchema } = require("../Schema/transactionSchema");

// Pay-per-use / Access Pass Transaction
router.post(
  "/purchase",
  authenticate,
  validate(purchaseSchema),
  createTransaction,
);
router.get(
  "/history",
  authenticate,
  getTransactionHistory,
);

// Admin routes for transactions
router.get("/", authenticate, authorize(["admin"]), getAllTransactions);
router.put("/:id", authenticate, authorize(["admin"]), validate(updateTransactionSchema), updateTransaction);
router.delete("/:id", authenticate, authorize(["admin"]), deleteTransaction);

module.exports = router;
