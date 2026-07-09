const Joi = require("joi");

const createSubscriptionSchema = Joi.object({
  plan_name: Joi.string().trim().min(1).required(),
  price: Joi.number().min(0).required(),
  duration_days: Joi.number().greater(0).required(),
  description: Joi.string().trim().allow("").default(""),
});

const updateSubscriptionSchema = Joi.object({
  plan_name: Joi.string().trim().min(1),
  price: Joi.number().min(0),
  duration_days: Joi.number().greater(0),
  description: Joi.string().trim().allow(""),
}).min(1);

module.exports = { createSubscriptionSchema, updateSubscriptionSchema };
