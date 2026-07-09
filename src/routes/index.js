const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const animeRoutes = require("./anime");
const transactionRoutes = require("./transaction");
const userRoutes = require("./user");
const subscriptionRoutes = require("./subscription");
const reviewRoutes = require("./review");

router.use("/auth", authRoutes);
router.use("/anime", animeRoutes);
router.use("/transactions", transactionRoutes);
router.use("/users", userRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/reviews", reviewRoutes);

module.exports = router;
