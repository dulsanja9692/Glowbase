const express = require("express");
const {
  listProducts, listMine, getProduct, createProduct, updateProduct, deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const upload = require("../middleware/upload");
const asyncH = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncH(listProducts));
router.get("/mine", protect, requireRole("admin", "superadmin"), asyncH(listMine));
router.get("/:id", asyncH(getProduct));

// Only admins (sellers) and superadmins can list/edit/delete products.
router.post("/", protect, requireRole("admin", "superadmin"), upload.single("image"), asyncH(createProduct));
router.patch("/:id", protect, requireRole("admin", "superadmin"), upload.single("image"), asyncH(updateProduct));
router.delete("/:id", protect, requireRole("admin", "superadmin"), asyncH(deleteProduct));

module.exports = router;
