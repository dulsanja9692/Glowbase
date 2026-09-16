const express = require("express");
const { register, login, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const asyncH = require("../utils/asyncHandler");

const router = express.Router();

router.post("/register", asyncH(register));
router.post("/login", asyncH(login));
router.get("/me", protect, asyncH(me));

module.exports = router;
