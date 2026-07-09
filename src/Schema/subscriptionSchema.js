const Joi = require("joi");

const createSubscriptionSchema = Joi.object({
  plan_name: Joi.string().required(),
  price: Joi.number().required(),
  duration_days: Joi.number().integer().min(1).required(),
  description: Joi.string().allow("").optional()
});

const updateSubscriptionSchema = Joi.object({
  plan_name: Joi.string(),
  price: Joi.number(),
  duration_days: Joi.number().integer().min(1),
  description: Joi.string().allow("").optional()
});

module.exports = { createSubscriptionSchema, updateSubscriptionSchema };
