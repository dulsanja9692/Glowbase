const express = require("express");
const { mockCharge } = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");
const asyncH = require("../utils/asyncHandler");

const router = express.Router();

router.post("/mock-charge", protect, asyncH(mockCharge));

module.exports = router;
