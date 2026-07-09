require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

// Import Routes
const routes = require("./src/routes");

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware untuk menyajikan folder uploads agar gambar bisa diakses publik via URL
app.use("/uploads", express.static("uploads"));

// Setup Routes
app.use("/api", routes);

// Konek ke MongoDB via Mongoose
const MONGO_URI =
  "mongodb://bontrex_db_user:FB32HpAtG1BaX4tL@ac-q2f8wyg-shard-00-00.ohzcpfe.mongodb.net:27017,ac-q2f8wyg-shard-00-01.ohzcpfe.mongodb.net:27017,ac-q2f8wyg-shard-00-02.ohzcpfe.mongodb.net:27017/anime_subscription_db?ssl=true&replicaSet=atlas-z1t9kt-shard-0&authSource=admin";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(
      "✅ Connected to MongoDB via Mongoose! Silakan cek di Compass.",
    );
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Gagal connect ke MongoDB:", err.message);
  });
