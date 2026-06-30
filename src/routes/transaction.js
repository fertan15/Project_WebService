const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { authenticate } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const Joi = require("joi");

const purchaseSchema = Joi.object({
  paymentMethod: Joi.string()
    .valid("e-wallet", "credit_card", "bank_transfer")
    .required(),
  items: Joi.array()
    .items(
      Joi.object({
        animeId: Joi.string().required(),
        price: Joi.number().positive().required(),
      }),
    )
    .min(1)
    .required(),
});

// Pay-per-use / Access Pass Transaction
router.post(
  "/purchase",
  authenticate,
  validate(purchaseSchema),
  transactionController.createTransaction,
);
router.get(
  "/history",
  authenticate,
  transactionController.getTransactionHistory,
);

module.exports = router;
