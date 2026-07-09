const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const watchStatuses = ["plan_to_watch", "watching", "completed", "dropped"];

const createWatchlistSchema = Joi.object({
  anime_id: Joi.string().pattern(objectIdPattern).required(),
  status: Joi.string()
    .valid(...watchStatuses)
    .default("plan_to_watch"),
});

const updateWatchlistSchema = Joi.object({
  status: Joi.string()
    .valid(...watchStatuses)
    .required(),
});

module.exports = {
  createWatchlistSchema,
  updateWatchlistSchema,
  watchStatuses,
};
