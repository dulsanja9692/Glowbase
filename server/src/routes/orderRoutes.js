const express = require("express");
const { createOrder, myOrders, listOrders, updateStatus } = require("../controllers/orderController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const asyncH = require("../utils/asyncHandler");

const router = express.Router();

router.post("/", protect, asyncH(createOrder)); // any logged-in customer
router.get("/mine", protect, asyncH(myOrders));
router.get("/", protect, requireRole("admin", "superadmin"), asyncH(listOrders));
router.patch("/:id/status", protect, requireRole("admin", "superadmin"), asyncH(updateStatus));

module.exports = router;
