const mongoose = require("mongoose");
const axios = require("axios");
const { ObjectId } = require("mongodb");

// 3rd Party API integration (jikan.moe)
const searchFromJikan = async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${q}`);
    res.status(200).json({ source: "Jikan API", data: response.data.data });
  } catch (error) {
    res.status(502).json({
      message: "Failed to fetch data from Jikan API",
      error: error.message,
    });
  }
};

// CRUD Master
const getAllAnime = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const animeList = await db.collection("animes").find().toArray();
    res.status(200).json(animeList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnimeById = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const anime = await db
      .collection("animes")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!anime) return res.status(404).json({ message: "Anime not found" });
    res.status(200).json(anime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAnime = async (req, res) => {
  try {
    const { title, synopsis, episodes, isPremium } = req.body;
    const coverImage = req.file ? req.file.path : null;

    const db = mongoose.connection.db;
    const result = await db.collection("animes").insertOne({
      title,
      synopsis,
      episodes,
      isPremium,
      coverImage,
      createdAt: new Date(),
    });

    const newAnime = await db
      .collection("animes")
      .findOne({ _id: result.insertedId });
    res
      .status(201)
      .json({ message: "Anime created successfully", data: newAnime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAnime = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.coverImage = req.file.path;

    const db = mongoose.connection.db;
    const result = await db
      .collection("animes")
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData },
        { returnDocument: "after" },
      );

    if (!result) return res.status(404).json({ message: "Anime not found" });

    res
      .status(200)
      .json({ message: "Anime updated successfully", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAnime = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const deletedAnime = await db
      .collection("animes")
      .findOneAndDelete({ _id: new ObjectId(req.params.id) });

    if (!deletedAnime)
      return res.status(404).json({ message: "Anime not found" });

    res.status(200).json({ message: "Anime master deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const watchAnime = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const userId = req.user.id;
    const animeId = req.params.id;

    // 1. Fetch Anime
    const anime = await db
      .collection("animes")
      .findOne({ _id: new ObjectId(animeId) });
    if (!anime) return res.status(404).json({ message: "Anime not found" });

    // 2. Fetch User to check subscription status
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Cek jika field menggunakan isPremium (baru) atau is_premium_only (seeder lama)
    const requiresPremium = anime.isPremium || anime.is_premium_only;

    // 3. Logic check: Jika butuh premium tapi user bukan premium
    if (requiresPremium && user.subscription_status !== "premium") {
      return res.status(403).json({
        message: "This anime requires a premium subscription to watch.",
      });
    }

    // Success (User bisa menonton)
    res.status(200).json({
      message: "You are now watching the anime",
      animeTitle: anime.title,
      isPremium: requiresPremium,
      videoUrl: `https://wawa.com/watch/${animeId}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
