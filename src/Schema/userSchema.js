const Joi = require("joi");

const updateUserSchema = Joi.object({
  role: Joi.string().valid("user", "admin"),
  username: Joi.string(),
  email: Joi.string().email(),
  wallet: Joi.number(),
  subscription_status: Joi.string()
});

module.exports = { updateUserSchema };
