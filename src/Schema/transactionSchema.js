const Joi = require("joi");

const purchaseSchema = Joi.object({
  paymentMethod: Joi.string()
    .valid("Wallet", "e-wallet", "credit_card", "bank_transfer")
    .required(),
  planId: Joi.string().required(),
});

const updateTransactionSchema = Joi.object({
  status: Joi.string().valid("Success", "Pending", "Failed"),
  payment_method: Joi.string().valid("Wallet", "e-wallet", "credit_card", "bank_transfer")
});

module.exports = { purchaseSchema, updateTransactionSchema };
