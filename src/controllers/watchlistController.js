const mongoose = require("mongoose");
const { toObjectId } = require("../utils/objectId");

const getMyWatchlist = async (req, res) => {
  try {
    const userObjectId = toObjectId(req.user.id);
    if (!userObjectId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const db = mongoose.connection.db;
    const watchlist = await db
      .collection("watchlists")
      .aggregate([
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
      ])
      .toArray();

    res.status(200).json(watchlist);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch watchlist", error: error.message });
  }
};

const addToWatchlist = async (req, res) => {
  try {
    const userObjectId = toObjectId(req.user.id);
    const animeObjectId = toObjectId(req.body.anime_id);

    if (!userObjectId || !animeObjectId) {
      return res.status(400).json({ message: "Invalid user id or anime id" });
    }

    const { status } = req.body;
    const db = mongoose.connection.db;

    const anime = await db.collection("animes").findOne({ _id: animeObjectId });
    if (!anime) {
      return res.status(404).json({ message: "Anime not found" });
    }

    const existingItem = await db.collection("watchlists").findOne({
      user_id: userObjectId,
      anime_id: animeObjectId,
    });

    if (existingItem) {
      return res
        .status(400)
        .json({
          message:
            "Anime already exists in your watchlist. Use PUT to update status.",
        });
    }

    const result = await db.collection("watchlists").insertOne({
      user_id: userObjectId,
      anime_id: animeObjectId,
      status: status || "plan_to_watch",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newItem = await db
      .collection("watchlists")
      .findOne({ _id: result.insertedId });

    res.status(201).json({
      message: "Anime added to watchlist successfully",
      data: newItem,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to add anime to watchlist",
        error: error.message,
      });
  }
};

const updateWatchlistItem = async (req, res) => {
  try {
    const watchlistObjectId = toObjectId(req.params.id);
    const userObjectId = toObjectId(req.user.id);

    if (!watchlistObjectId || !userObjectId) {
      return res
        .status(400)
        .json({ message: "Invalid watchlist id or user id" });
    }

    const db = mongoose.connection.db;
    const watchlistItem = await db
      .collection("watchlists")
      .findOne({ _id: watchlistObjectId });

    if (!watchlistItem) {
      return res.status(404).json({ message: "Watchlist item not found" });
    }

    if (
      req.user.role !== "admin" &&
      String(watchlistItem.user_id) !== String(userObjectId)
    ) {
      return res
        .status(403)
        .json({ message: "You can only update your own watchlist" });
    }

    const updatedItem = await db.collection("watchlists").findOneAndUpdate(
      { _id: watchlistObjectId },
      {
        $set: {
          status: req.body.status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    res.status(200).json({
      message: "Watchlist item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to update watchlist item",
        error: error.message,
      });
  }
};

const deleteWatchlistItem = async (req, res) => {
  try {
    const watchlistObjectId = toObjectId(req.params.id);
    const userObjectId = toObjectId(req.user.id);

    if (!watchlistObjectId || !userObjectId) {
      return res
        .status(400)
        .json({ message: "Invalid watchlist id or user id" });
    }

    const db = mongoose.connection.db;
    const watchlistItem = await db
      .collection("watchlists")
      .findOne({ _id: watchlistObjectId });

    if (!watchlistItem) {
      return res.status(404).json({ message: "Watchlist item not found" });
    }

    if (
      req.user.role !== "admin" &&
      String(watchlistItem.user_id) !== String(userObjectId)
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own watchlist" });
    }

    await db.collection("watchlists").deleteOne({ _id: watchlistObjectId });

    res.status(200).json({ message: "Watchlist item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to delete watchlist item",
        error: error.message,
      });
  }
};

module.exports = {
  getMyWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  deleteWatchlistItem,
};
