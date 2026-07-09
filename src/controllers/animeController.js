const mongoose = require("mongoose");
const axios = require("axios");
const { toObjectId } = require("../utils/objectId");

const normalizeAnime = (anime) => {
  if (!anime) return anime;

  return {
    ...anime,
    isPremium: anime.isPremium ?? anime.is_premium_only ?? false,
    coverImage: anime.coverImage ?? anime.cover_image ?? null,
  };
};

// 3rd Party API integration (jikan.moe)
const searchFromJikan = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Query q is required" });
    }

    const response = await axios.get("https://api.jikan.moe/v4/anime", {
      params: { q: q.trim() },
      timeout: 10000,
    });

    res.status(200).json({ source: "Jikan API", data: response.data.data });
  } catch (error) {
    res.status(502).json({
      message: "Failed to fetch data from Jikan API",
      error: error.message,
    });
  }
};

// CRUD Master Anime
const getAllAnime = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const animeList = await db
      .collection("animes")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(animeList.map(normalizeAnime));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch anime", error: error.message });
  }
};

const getAnimeById = async (req, res) => {
  try {
    const animeObjectId = toObjectId(req.params.id);
    if (!animeObjectId) {
      return res.status(400).json({ message: "Invalid anime id" });
    }

    const db = mongoose.connection.db;
    const anime = await db.collection("animes").findOne({ _id: animeObjectId });

    if (!anime) {
      return res.status(404).json({ message: "Anime not found" });
    }

    res.status(200).json(normalizeAnime(anime));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch anime", error: error.message });
  }
};

const createAnime = async (req, res) => {
  try {
    const { title, synopsis, episodes, isPremium, type } = req.body;
    const coverImage = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const db = mongoose.connection.db;
    const result = await db.collection("animes").insertOne({
      title,
      synopsis,
      episodes: Number(episodes),
      isPremium: Boolean(isPremium),
      coverImage,
      type: type || "TV",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newAnime = await db.collection("animes").findOne({ _id: result.insertedId });

    res.status(201).json({
      message: "Anime created successfully",
      data: normalizeAnime(newAnime),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create anime", error: error.message });
  }
};

const updateAnime = async (req, res) => {
  try {
    const animeObjectId = toObjectId(req.params.id);
    if (!animeObjectId) {
      return res.status(400).json({ message: "Invalid anime id" });
    }

    const updateData = { ...req.body, updatedAt: new Date() };

    if (updateData.episodes !== undefined) {
      updateData.episodes = Number(updateData.episodes);
    }

    if (updateData.isPremium !== undefined) {
      updateData.isPremium = Boolean(updateData.isPremium);
    }

    if (req.file) {
      updateData.coverImage = req.file.path.replace(/\\/g, "/");
    }

    const db = mongoose.connection.db;
    const result = await db.collection("animes").findOneAndUpdate(
      { _id: animeObjectId },
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!result) {
      return res.status(404).json({ message: "Anime not found" });
    }

    res.status(200).json({
      message: "Anime updated successfully",
      data: normalizeAnime(result),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update anime", error: error.message });
  }
};

const deleteAnime = async (req, res) => {
  try {
    const animeObjectId = toObjectId(req.params.id);
    if (!animeObjectId) {
      return res.status(400).json({ message: "Invalid anime id" });
    }

    const db = mongoose.connection.db;
    const deletedAnime = await db.collection("animes").findOneAndDelete({ _id: animeObjectId });

    if (!deletedAnime) {
      return res.status(404).json({ message: "Anime not found" });
    }

    // Clean related user data so deleted anime does not leave broken review/watchlist rows.
    await db.collection("reviews").deleteMany({ anime_id: animeObjectId });
    await db.collection("watchlists").deleteMany({ anime_id: animeObjectId });

    res.status(200).json({ message: "Anime deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete anime", error: error.message });
  }
};

const watchAnime = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const userObjectId = toObjectId(req.user.id);
    const animeObjectId = toObjectId(req.params.id);

    if (!userObjectId || !animeObjectId) {
      return res.status(400).json({ message: "Invalid user id or anime id" });
    }

    const anime = await db.collection("animes").findOne({ _id: animeObjectId });
    if (!anime) {
      return res.status(404).json({ message: "Anime not found" });
    }

    const user = await db.collection("users").findOne({ _id: userObjectId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const normalizedAnime = normalizeAnime(anime);
    const requiresPremium = Boolean(normalizedAnime.isPremium);
    let isUserPremium = user.subscription_status === "premium";

    if (isUserPremium && user.premium_until && new Date() > new Date(user.premium_until)) {
      isUserPremium = false;

      await db.collection("users").updateOne(
        { _id: userObjectId },
        { $set: { subscription_status: "basic", premium_until: null } },
      );
    }

    if (requiresPremium && !isUserPremium) {
      return res.status(403).json({
        message: "This anime requires an active premium subscription to watch.",
      });
    }

    res.status(200).json({
      message: "You are now watching the anime",
      animeTitle: normalizedAnime.title,
      isPremium: requiresPremium,
      videoUrl: `https://wawa.com/watch/${animeObjectId}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to watch anime", error: error.message });
  }
};

module.exports = {
  searchFromJikan,
  getAllAnime,
  getAnimeById,
  createAnime,
  updateAnime,
  deleteAnime,
  watchAnime,
};
