const Anime = require("../models/Anime");
const axios = require("axios");

// 3rd Party API integration (jikan.moe)
exports.searchFromJikan = async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${q}`);
    res.status(200).json({ source: "Jikan API", data: response.data.data });
  } catch (error) {
    res
      .status(502)
      .json({
        message: "Failed to fetch data from Jikan API",
        error: error.message,
      });
  }
};

// CRUD Master
exports.getAllAnime = async (req, res) => {
  try {
    const animeList = await Anime.find();
    res.status(200).json(animeList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnimeById = async (req, res) => {
  try {
    const anime = await Anime.findById(req.params.id);
    if (!anime) return res.status(404).json({ message: "Anime not found" });
    res.status(200).json(anime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAnime = async (req, res) => {
  try {
    const { title, synopsis, episodes, isPremium } = req.body;
    const coverImage = req.file ? req.file.path : null; // Ambil path file dari Multer

    const newAnime = await Anime.create({
      title,
      synopsis,
      episodes,
      isPremium,
      coverImage,
    });
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

    const updatedAnime = await Anime.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    if (!updatedAnime)
      return res.status(404).json({ message: "Anime not found" });

    res
      .status(200)
      .json({ message: "Anime updated successfully", data: updatedAnime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAnime = async (req, res) => {
  try {
    const deletedAnime = await Anime.findByIdAndDelete(req.params.id);
    if (!deletedAnime)
      return res.status(404).json({ message: "Anime not found" });
    res.status(200).json({ message: "Anime master deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
