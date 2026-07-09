const express = require("express");
const router = express.Router();
const {
  getReviewsByAnime,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { authenticate, validate } = require("../middlewares");
const { createReviewSchema, updateReviewSchema } = require("../Schema/reviewSchema");

router.get("/anime/:animeId", getReviewsByAnime);
router.get("/my", authenticate, getMyReviews);
router.post("/", authenticate, validate(createReviewSchema), createReview);
router.put("/:id", authenticate, validate(updateReviewSchema), updateReview);
router.delete("/:id", authenticate, deleteReview);

module.exports = router;
