const Joi = require("joi");

const animeSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  synopsis: Joi.string().trim().min(1).required(),
  episodes: Joi.number().integer().min(1).required(),
  isPremium: Joi.boolean().default(false),
  type: Joi.string().trim().allow("").optional(),
});

const updateAnimeSchema = Joi.object({
  title: Joi.string().trim().min(1),
  synopsis: Joi.string().trim().min(1),
  episodes: Joi.number().integer().min(1),
  isPremium: Joi.boolean(),
  type: Joi.string().trim().allow("").optional(),
}).min(1);

module.exports = { animeSchema, updateAnimeSchema };
