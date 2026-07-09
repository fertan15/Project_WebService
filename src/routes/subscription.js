const express = require("express");
const router = express.Router();
const {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require("../controllers/subscriptionController");
const { authenticate, authorize, validate } = require("../middlewares");
const {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} = require("../Schema/subscriptionSchema");

// Public routes to view plans
router.get("/", getAllSubscriptions);
router.get("/:id", getSubscriptionById);

// Admin routes for managing plans
router.post("/", authenticate, authorize(["admin"]), validate(createSubscriptionSchema), createSubscription);
router.put("/:id", authenticate, authorize(["admin"]), validate(updateSubscriptionSchema), updateSubscription);
router.delete("/:id", authenticate, authorize(["admin"]), deleteSubscription);

module.exports = router;
