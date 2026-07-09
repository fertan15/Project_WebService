require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const routes = require("./src/routes");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Anime Subscription API is running",
    routes: {
      auth: "/api/auth",
      anime: "/api/anime",
      subscriptions: "/api/subscriptions",
      transactions: "/api/transactions",
      users: "/api/users",
      reviews: "/api/reviews",
      watchlist: "/api/watchlist",
    },
  });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err && err.name === "MulterError") {
    return res.status(400).json({ message: "Upload error", error: err.message });
  }

  if (err) {
    return res.status(400).json({ message: err.message || "Bad request" });
  }

  next();
});

const startServer = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI belum diisi di file .env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET belum diisi di file .env");
    }

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB via Mongoose! Silakan cek di Compass.");

    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Gagal menjalankan server:", error.message);
    process.exit(1);
  }
};

startServer();
