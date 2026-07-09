const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

// Set seed agar data dummy yang dihasilkan Faker selalu sama setiap kali dijalankan
faker.seed(75);

const MONGO_URI =
  "mongodb://bontrex_db_user:FB32HpAtG1BaX4tL@ac-q2f8wyg-shard-00-00.ohzcpfe.mongodb.net:27017,ac-q2f8wyg-shard-00-01.ohzcpfe.mongodb.net:27017,ac-q2f8wyg-shard-00-02.ohzcpfe.mongodb.net:27017/anime_subscription_db?ssl=true&replicaSet=atlas-z1t9kt-shard-0&authSource=admin";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Sukses terhubung ke MongoDB.");
    // Jalankan seeder setelah koneksi berhasil
    seedDatabase();
  })
  .catch((err) => console.error("Gagal terhubung ke MongoDB:", err));

const bcrypt = require("bcrypt");

// ==========================================
// 2. SEEDER DATA DUMMY (SCHEMALESS & FAKER)
// ==========================================
const seedDatabase = async () => {
  try {
    const db = mongoose.connection.db;

    // Bersihkan database lama jika ada
    await db.collection("users").deleteMany({});
    await db.collection("animes").deleteMany({});
    await db.collection("subscriptionplans").deleteMany({});
    await db.collection("invoices").deleteMany({});
    console.log("Database lama berhasil dibersihkan.");

    const defaultPassword = await bcrypt.hash("wawa123", 10);

    // --- 1. SEED MASTER USERS ---
    const usersData = [
      {
        username: "admin_main",
        email: "admin@stts.edu",
        password: defaultPassword,
        role: "admin",
        wallet: 0,
        subscription_status: "basic",
        premium_until: null,
        createdAt: new Date(),
      },
    ];

    for (let i = 0; i < 5; i++) {
      const status = faker.helpers.arrayElement(["basic", "premium"]);
      usersData.push({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: defaultPassword,
        role: "user",
        wallet: faker.number.int({ min: 100000, max: 1000000 }),
        subscription_status: status,
        premium_until: status === "premium" ? faker.date.future() : null,
        createdAt: new Date(),
      });
    }
    const usersResult = await db.collection("users").insertMany(usersData);
    console.log("Master Users (Faker, Seed 75) berhasil dibuat.");

    // --- 2. SEED MASTER ANIMES ---
    const animesData = [];
    for (let i = 0; i < 5; i++) {
      animesData.push({
        mal_id: faker.number.int({ min: 1, max: 60000 }),
        title: faker.commerce.productName() + " The Animation",
        synopsis: faker.lorem.paragraph(),
        cover_image: faker.image.urlLoremFlickr({ category: "anime" }),
        type: faker.helpers.arrayElement(["TV", "Movie", "OVA"]),
        is_premium_only: faker.datatype.boolean(),
        createdAt: new Date(),
      });
    }
    await db.collection("animes").insertMany(animesData);
    console.log("Master Animes (Faker, Seed 75) berhasil dibuat.");

    // --- 3. SEED MASTER SUBSCRIPTION PLANS ---
    const plansData = [
      {
        plan_name: "30 Seconds Trial",
        price: 5000,
        duration_days: 30 / 86400, // 30 seconds in days
        description: "Trial premium 30 detik.",
      },
      {
        plan_name: "1 Month Premium Access",
        price: 50000,
        duration_days: 30,
        description: "Akses penuh premium 30 hari.",
      },
      {
        plan_name: "3 Month Premium Bundle",
        price: 135000,
        duration_days: 90,
        description: "Lebih hemat 90 hari.",
      },
      {
        plan_name: "1 Year Premium",
        price: 450000,
        duration_days: 365,
        description: "Akses penuh premium 1 tahun.",
      },
    ];
    const plansResult = await db
      .collection("subscriptionplans")
      .insertMany(plansData);
    console.log("Master Plans berhasil dibuat.");

    // --- 4. SEED TRANSAKSI ---
    // Karena menggunakan seed, insertedIds dari proses di atas akan selalu sama urutannya
    const randomUserObjectId = usersResult.insertedIds[1];
    const planPremiumId = plansResult.insertedIds[0]; // 1 Month

    const pricePremium = plansData[0].price;

    // Create Invoice matching transactionController
    await db.collection("invoices").insertOne({
      user_id: randomUserObjectId,
      plan_id: planPremiumId,
      invoice_date: new Date(),
      total_amount: pricePremium,
      payment_method: "Wallet",
      status: "Success",
      createdAt: new Date(),
    });

    console.log("Transaksi (Faker, Seed 75) berhasil dibuat.");
    console.log("Proses Seeding Selesai!");
  } catch (error) {
    console.error("Gagal melakukan seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
};
