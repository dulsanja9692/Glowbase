const express = require("express");
const { apply, listRequests, approve, reject } = require("../controllers/sellerRequestController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const asyncH = require("../utils/asyncHandler");

const router = express.Router();

router.post("/", asyncH(apply)); // public - anyone can apply to sell

// Reviewing and deciding on applications is superadmin-only.
router.use(protect, requireRole("superadmin"));
router.get("/", asyncH(listRequests));
router.patch("/:id/approve", asyncH(approve));
router.patch("/:id/reject", asyncH(reject));

module.exports = router;
