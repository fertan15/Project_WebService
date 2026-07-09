const express = require("express");
const router = express.Router();
const {
  searchFromJikan,
  getAllAnime,
  getAnimeById,
  createAnime,
  updateAnime,
  deleteAnime,
  watchAnime
} = require("../controllers/animeController");
const { authenticate, authorize, upload, validate } = require("../middlewares");
const { animeSchema } = require("../Schema/animeSchema");

// 3rd Party API Endpoint (Public / Authenticated)
router.get("/jikan/search", searchFromJikan);

// Local CRUD Master (Admin Only)
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
  updateAnime,
);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  deleteAnime,
);

// Watch Anime (Authenticated, Premium Check)
router.get("/:id/watch", authenticate, watchAnime);

module.exports = router;
