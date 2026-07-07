const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

// Pay-Per-Use Model (Beli Akses Anime Premium)
exports.createTransaction = async (req, res) => {
  // Menggunakan Mongoose Session untuk ACID Transaction (Wajib jika update multi-collection)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentMethod, items } = req.body; // items: [{ animeId, price }]
    const userId = req.user.id;
    const db = mongoose.connection.db;

    // 1. Hitung total price dari detail items
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

    // 2. Create Header
    const headerResult = await db.collection("invoices").insertOne(
      {
        user_id: new ObjectId(userId),
        invoice_date: new Date(),
        total_amount: totalPrice,
        payment_method: paymentMethod,
        status: "completed", // Berasumsi langsung sukses demi kemudahan demonstrasi
        createdAt: new Date(),
      },
      { session },
    );

    const headerId = headerResult.insertedId;

    // 3. Map items untuk dimasukkan ke Detail dengan referensi ke Header ID
    const detailItems = items.map((item) => ({
      invoice_id: headerId,
      animeId: new ObjectId(item.animeId),
      price_at_transaction: item.price,
      qty: 1,
      sub_total: item.price * 1,
      createdAt: new Date(),
    }));

    // 4. Create Detail
    await db.collection("invoicedetails").insertMany(detailItems, { session });

    // Commit semua aksi database jika berhasil
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Transaction (Pay-per-use) successful",
      transactionId: headerId,
      totalPaid: totalPrice,
    });
  } catch (error) {
    // Batalkan semua query jika terjadi error di tengah jalan
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ message: "Transaction failed", error: error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const db = mongoose.connection.db;

    // Ambil Header milik user saat ini
    const headers = await db
      .collection("invoices")
      .find({ user_id: new ObjectId(req.user.id) })
      .toArray();

    // Cari detail untuk masing-masing header dan populate data anime (melalui $lookup)
    const fullHistory = await Promise.all(
      headers.map(async (header) => {
        const details = await db
          .collection("invoicedetails")
          .aggregate([
            { $match: { invoice_id: header._id } },
            {
              $lookup: {
                from: "animes",
                localField: "animeId",
                foreignField: "_id",
                as: "anime",
              },
            },
            { $unwind: { path: "$anime", preserveNullAndEmptyArrays: true } },
          ])
          .toArray();

        return {
          header,
          details,
        };
      }),
    );

    res.status(200).json(fullHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
