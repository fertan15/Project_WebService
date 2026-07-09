const Joi = require("joi");

const updateUserSchema = Joi.object({
  role: Joi.string().valid("user", "admin"),
  username: Joi.string().trim().min(3),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  wallet: Joi.number().min(0),
  subscription_status: Joi.string().valid("basic", "premium"),
  premium_until: Joi.date().allow(null),
}).min(1);

module.exports = { updateUserSchema };
