const Joi = require("joi");

const animeSchema = Joi.object({
  title: Joi.string().required(),
  synopsis: Joi.string().required(),
  episodes: Joi.number().integer().min(1).required(),
  isPremium: Joi.boolean().default(false),
});

module.exports = { animeSchema };
