require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const seedDatabase = async () => {
  const db = mongoose.connection.db;

  await db.collection("users").deleteMany({});
  await db.collection("animes").deleteMany({});
  await db.collection("subscriptionplans").deleteMany({});
  await db.collection("invoices").deleteMany({});
  await db.collection("reviews").deleteMany({});
  await db.collection("watchlists").deleteMany({});

  console.log("Database lama berhasil dibersihkan.");

  const defaultPassword = await bcrypt.hash("wawa123", 10);

  const usersResult = await db.collection("users").insertMany([
    {
      username: "admin_main",
      email: "admin@stts.edu",
      password: defaultPassword,
      role: "admin",
      wallet: 0,
      subscription_status: "basic",
      premium_until: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: "wawa_user",
      email: "user@stts.edu",
      password: defaultPassword,
      role: "user",
      wallet: 500000,
      subscription_status: "premium",
      premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: "basic_user",
      email: "basic@stts.edu",
      password: defaultPassword,
      role: "user",
      wallet: 100000,
      subscription_status: "basic",
      premium_until: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const animesResult = await db.collection("animes").insertMany([
    {
      title: "One Piece",
      synopsis: "Monkey D. Luffy sails with his crew to find the legendary treasure One Piece.",
      episodes: 1000,
      isPremium: false,
      coverImage: "uploads/one-piece-1783064070109.jpeg",
      type: "TV",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Premium Samurai Saga",
      synopsis: "A premium-only samurai anime about loyalty, power, and destiny.",
      episodes: 24,
      isPremium: true,
      coverImage: "uploads/wawa-1783061611131.jpeg",
      type: "TV",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Sky Academy",
      synopsis: "Students at a floating academy learn to protect the world from monsters.",
      episodes: 12,
      isPremium: false,
      coverImage: "uploads/wawa-1783065448684.jpeg",
      type: "TV",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const plansResult = await db.collection("subscriptionplans").insertMany([
    {
      plan_name: "30 Seconds Trial",
      price: 5000,
      duration_days: 30 / 86400,
      description: "Trial premium 30 detik.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      plan_name: "1 Month Premium Access",
      price: 50000,
      duration_days: 30,
      description: "Akses penuh premium 30 hari.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      plan_name: "3 Month Premium Bundle",
      price: 135000,
      duration_days: 90,
      description: "Lebih hemat 90 hari.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      plan_name: "1 Year Premium",
      price: 450000,
      duration_days: 365,
      description: "Akses penuh premium 1 tahun.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const userId = usersResult.insertedIds[1];
  const animeId = animesResult.insertedIds[0];
  const premiumAnimeId = animesResult.insertedIds[1];
  const planId = plansResult.insertedIds[1];

  await db.collection("invoices").insertOne({
    user_id: userId,
    plan_id: planId,
    invoice_date: new Date(),
    total_amount: 50000,
    payment_method: "Wallet",
    status: "Success",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.collection("reviews").insertOne({
    user_id: userId,
    anime_id: animeId,
    rating: 5,
    comment: "Great anime and fun to watch.",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.collection("watchlists").insertMany([
    {
      user_id: userId,
      anime_id: animeId,
      status: "watching",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      user_id: userId,
      anime_id: premiumAnimeId,
      status: "plan_to_watch",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("reviews").createIndex({ user_id: 1, anime_id: 1 }, { unique: true });
  await db.collection("watchlists").createIndex({ user_id: 1, anime_id: 1 }, { unique: true });

  console.log("Proses seeding selesai.");
  console.log("Admin login: admin@stts.edu / wawa123");
  console.log("User login: user@stts.edu / wawa123");
};

const runSeeder = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI belum diisi di file .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Sukses terhubung ke MongoDB.");
    await seedDatabase();
  } catch (error) {
    console.error("Gagal melakukan seeding data:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

if (require.main === module) {
  runSeeder();
}

module.exports = { seedDatabase };
