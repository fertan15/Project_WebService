const express = require("express");
const router = express.Router();
const {
  searchFromJikan,
  getAllAnime,
  getAnimeById,
  createAnime,
  updateAnime,
  deleteAnime,
  watchAnime,
} = require("../controllers/animeController");
const { authenticate, authorize, upload, validate } = require("../middlewares");
const { animeSchema, updateAnimeSchema } = require("../Schema/animeSchema");

// 3rd Party API Endpoint
router.get("/jikan/search", searchFromJikan);

// Watch Anime must be placed before /:id to avoid route confusion.
router.get("/:id/watch", authenticate, watchAnime);

// Local CRUD Master Anime
router.get("/", getAllAnime);
router.get("/:id", getAnimeById);
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  upload.single("coverImage"),
  validate(animeSchema),
  createAnime,
);
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  upload.single("coverImage"),
  validate(updateAnimeSchema),
  updateAnime,
);
router.delete("/:id", authenticate, authorize(["admin"]), deleteAnime);

module.exports = router;
