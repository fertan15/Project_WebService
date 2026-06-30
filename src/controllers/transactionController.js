const OrderHeader = require("../models/OrderHeader");
const OrderDetail = require("../models/OrderDetail");
const mongoose = require("mongoose");

// Pay-Per-Use Model (Beli Akses Anime Premium)
exports.createTransaction = async (req, res) => {
  // Menggunakan Mongoose Session untuk ACID Transaction (Wajib jika update multi-collection)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentMethod, items } = req.body; // items: [{ animeId, price }]
    const userId = req.user.id;

    // 1. Hitung total price dari detail items
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

    // 2. Create Header
    const header = await OrderHeader.create(
      [
        {
          userId,
          totalPrice,
          paymentMethod,
          status: "completed", // Berasumsi langsung sukses demi kemudahan demonstrasi
        },
      ],
      { session },
    );

    const headerId = header[0]._id;

    // 3. Map items untuk dimasukkan ke Detail dengan referensi ke Header ID
    const detailItems = items.map((item) => ({
      orderHeaderId: headerId,
      animeId: item.animeId,
      price: item.price,
    }));

    // 4. Create Detail
    await OrderDetail.insertMany(detailItems, { session });

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
    // Ambil Header milik user saat ini
    const headers = await OrderHeader.find({ userId: req.user.id });

    // Cari detail untuk masing-masing header (atau gunakan .populate() jika schema mendukung)
    const fullHistory = await Promise.all(
      headers.map(async (header) => {
        const details = await OrderDetail.find({
          orderHeaderId: header._id,
        }).populate("animeId", "title");
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
