const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createReviewSchema = Joi.object({
  anime_id: Joi.string().pattern(objectIdPattern).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().allow("").default(""),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().trim().allow(""),
}).min(1);

module.exports = {
  createReviewSchema,
  updateReviewSchema,
};
