const Joi = require("joi");

const purchaseSchema = Joi.object({
  paymentMethod: Joi.string()
    .valid("Wallet", "e-wallet", "credit_card", "bank_transfer")
    .required(),
  planId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
});

const updateTransactionSchema = Joi.object({
  status: Joi.string().valid("Success", "Pending", "Failed"),
  payment_method: Joi.string().valid("Wallet", "e-wallet", "credit_card", "bank_transfer"),
}).min(1);

module.exports = { purchaseSchema, updateTransactionSchema };
