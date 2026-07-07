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
    await db.collection("invoicedetails").deleteMany({});
    console.log("Database lama berhasil dibersihkan.");

    // --- 1. SEED MASTER USERS ---
    const usersData = [
      {
        username: "admin_main",
        email: "admin@stts.edu",
        password: "hashed_admin_password",
        role: "admin",
        createdAt: new Date(),
      },
    ];

    for (let i = 0; i < 5; i++) {
      usersData.push({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: "user",
        subscription_status: faker.helpers.arrayElement(["basic", "premium"]),
        premium_until: faker.date.future(),
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
        plan_name: "Pay-Per-View Movie Ticket",
        price: 25000,
        duration_days: 7,
        description: "Tiket khusus nonton 1 movie.",
      },
    ];
    const plansResult = await db
      .collection("subscriptionplans")
      .insertMany(plansData);
    console.log("Master Plans berhasil dibuat.");

    // --- 4. SEED TRANSAKSI (HEADER-DETAIL) ---
    // Karena menggunakan seed, insertedIds dari proses di atas akan selalu sama urutannya
    const randomUserObjectId = usersResult.insertedIds[1];
    const planPremiumId = plansResult.insertedIds[0];
    const planMovieId = plansResult.insertedIds[2];

    const pricePremium = plansData[0].price;
    const priceMovie = plansData[2].price;
    const grandTotal = pricePremium + priceMovie;

    // A. Create Header (Invoice)
    const newInvoice = await db.collection("invoices").insertOne({
      invoice_number: `INV-${faker.string.alphanumeric({ length: 8, casing: "upper" })}`,
      user_id: randomUserObjectId,
      invoice_date: new Date(),
      total_amount: grandTotal,
      payment_method: faker.helpers.arrayElement([
        "OVO",
        "GoPay",
        "Dana",
        "Credit Card",
      ]),
      status: "Success",
      createdAt: new Date(),
    });

    // B. Create Detail (Invoice Details)
    await db.collection("invoicedetails").insertMany([
      {
        invoice_id: newInvoice.insertedId,
        plan_id: planPremiumId,
        price_at_transaction: pricePremium,
        qty: 1,
        sub_total: pricePremium * 1,
        createdAt: new Date(),
      },
      {
        invoice_id: newInvoice.insertedId,
        plan_id: planMovieId,
        price_at_transaction: priceMovie,
        qty: 1,
        sub_total: priceMovie * 1,
        createdAt: new Date(),
      },
    ]);

    console.log("Transaksi Header-Detail (Faker, Seed 75) berhasil dibuat.");
    console.log("Proses Seeding Selesai!");
  } catch (error) {
    console.error("Gagal melakukan seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
};
