const express = require("express");
const router = express.Router();
const animeController = require("../controllers/animeController");
const { authenticate, authorize } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const validate = require("../middlewares/validate");
const Joi = require("joi");

const animeSchema = Joi.object({
  title: Joi.string().required(),
  synopsis: Joi.string().required(),
  episodes: Joi.number().integer().min(1).required(),
  isPremium: Joi.boolean().default(false),
});

// 3rd Party API Endpoint (Public / Authenticated)
router.get("/jikan/search", animeController.searchFromJikan);

// Local CRUD Master (Admin Only)
router.get("/", animeController.getAllAnime);
router.get("/:id", animeController.getAnimeById);
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  upload.single("coverImage"),
  validate(animeSchema),
  animeController.createAnime,
);
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  upload.single("coverImage"),
  animeController.updateAnime,
);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  animeController.deleteAnime,
);

module.exports = router;
