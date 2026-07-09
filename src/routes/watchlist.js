const express = require("express");
const router = express.Router();
const {
  getMyWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  deleteWatchlistItem,
} = require("../controllers/watchlistController");
const { authenticate, validate } = require("../middlewares");
const {
  createWatchlistSchema,
  updateWatchlistSchema,
} = require("../Schema/watchlistSchema");

router.get("/", authenticate, getMyWatchlist);
router.post("/", authenticate, validate(createWatchlistSchema), addToWatchlist);
router.put(
  "/:id",
  authenticate,
  validate(updateWatchlistSchema),
  updateWatchlistItem,
);
router.delete("/:id", authenticate, deleteWatchlistItem);

module.exports = router;
