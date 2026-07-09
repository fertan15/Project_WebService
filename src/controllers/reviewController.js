const mongoose = require("mongoose");
const { toObjectId } = require("../utils/objectId");

const canModifyReview = (req, review) => {
  return req.user.role === "admin" || String(review.user_id) === String(req.user.id);
};

const getReviewsByAnime = async (req, res) => {
  try {
    const animeObjectId = toObjectId(req.params.animeId);
    if (!animeObjectId) {
      return res.status(400).json({ message: "Invalid anime id" });
    }

    const db = mongoose.connection.db;
    const reviews = await db.collection("reviews").aggregate([
      { $match: { anime_id: animeObjectId } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "user.password": 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    const summary = await db.collection("reviews").aggregate([
      { $match: { anime_id: animeObjectId } },
      {
        $group: {
          _id: "$anime_id",
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
    ]).toArray();

    res.status(200).json({
      summary: summary[0] || { totalReviews: 0, averageRating: 0 },
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const userObjectId = toObjectId(req.user.id);
    if (!userObjectId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const db = mongoose.connection.db;
    const reviews = await db.collection("reviews").aggregate([
      { $match: { user_id: userObjectId } },
      {
        $lookup: {
          from: "animes",
          localField: "anime_id",
          foreignField: "_id",
          as: "anime",
        },
      },
      { $unwind: { path: "$anime", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your reviews", error: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const userObjectId = toObjectId(req.user.id);
    const animeObjectId = toObjectId(req.body.anime_id);

    if (!userObjectId || !animeObjectId) {
      return res.status(400).json({ message: "Invalid user id or anime id" });
    }

    const { rating, comment } = req.body;
    const db = mongoose.connection.db;

    const anime = await db.collection("animes").findOne({ _id: animeObjectId });
    if (!anime) {
      return res.status(404).json({ message: "Anime not found" });
    }

    const existingReview = await db.collection("reviews").findOne({
      user_id: userObjectId,
      anime_id: animeObjectId,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You already reviewed this anime. Use PUT to update your review." });
    }

    const result = await db.collection("reviews").insertOne({
      user_id: userObjectId,
      anime_id: animeObjectId,
      rating: Number(rating),
      comment: comment || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newReview = await db.collection("reviews").findOne({ _id: result.insertedId });

    res.status(201).json({
      message: "Review created successfully",
      data: newReview,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create review", error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const reviewObjectId = toObjectId(req.params.id);
    if (!reviewObjectId) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const db = mongoose.connection.db;
    const review = await db.collection("reviews").findOne({ _id: reviewObjectId });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (!canModifyReview(req, review)) {
      return res.status(403).json({ message: "You can only update your own review" });
    }

    const updateFields = { updatedAt: new Date() };
    if (req.body.rating !== undefined) updateFields.rating = Number(req.body.rating);
    if (req.body.comment !== undefined) updateFields.comment = req.body.comment;

    const updatedReview = await db.collection("reviews").findOneAndUpdate(
      { _id: reviewObjectId },
      { $set: updateFields },
      { returnDocument: "after" },
    );

    res.status(200).json({
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update review", error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const reviewObjectId = toObjectId(req.params.id);
    if (!reviewObjectId) {
      return res.status(400).json({ message: "Invalid review id" });
    }

    const db = mongoose.connection.db;
    const review = await db.collection("reviews").findOne({ _id: reviewObjectId });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (!canModifyReview(req, review)) {
      return res.status(403).json({ message: "You can only delete your own review" });
    }

    await db.collection("reviews").deleteOne({ _id: reviewObjectId });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review", error: error.message });
  }
};

module.exports = {
  getReviewsByAnime,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
};
