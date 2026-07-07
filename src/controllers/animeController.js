const mongoose = require("mongoose");
const axios = require("axios");
const { ObjectId } = require("mongodb");

// 3rd Party API integration (jikan.moe)
exports.searchFromJikan = async (req, res) => {
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
exports.getAllAnime = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const animeList = await db.collection("animes").find().toArray();
    res.status(200).json(animeList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnimeById = async (req, res) => {
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

exports.createAnime = async (req, res) => {
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

exports.updateAnime = async (req, res) => {
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

exports.deleteAnime = async (req, res) => {
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
