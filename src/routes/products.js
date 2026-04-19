import { Router } from "express";
import {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getRelatedProducts,
  getCategories,
  addReview,
  createProduct,
  updateProduct,
  deleteProduct,
  adminGetProducts,
} from "../controllers/productController.js";
import { protect, adminOnly, optionalAuth } from "../middleware/auth.js";

const router = Router();

/* Public */
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/:id", getProduct);
router.get("/:id/related", getRelatedProducts);

/* Protected */
router.post("/:id/reviews", protect, addReview);

/* Admin */
router.get("/admin/all", protect, adminOnly, adminGetProducts);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
