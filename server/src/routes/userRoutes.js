const express = require("express");
const { listStaff, changeRole, removeUser } = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const asyncH = require("../utils/asyncHandler");

const router = express.Router();

// Every route here is superadmin-only: managing admins/users is the
// one thing regular admins must never be able to do. There is no
// "invite" route — sellers apply themselves via POST /api/seller-requests
// and set their own password; see sellerRequestRoutes.js.
router.use(protect, requireRole("superadmin"));

router.get("/", asyncH(listStaff));
router.patch("/:id/role", asyncH(changeRole));
router.delete("/:id", asyncH(removeUser));

module.exports = router;
