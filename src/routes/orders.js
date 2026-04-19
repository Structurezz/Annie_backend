import { Router } from "express";
import {
  createOrder,
  verifyOrderPayment,
  getUserOrders,
  getOrder,
  cancelOrder,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminStats,
} from "../controllers/orderController.js";
import { protect, optionalAuth, adminOnly } from "../middleware/auth.js";

const router = Router();

/* User routes */
router.post("/", optionalAuth, createOrder);
router.get("/verify/:reference", verifyOrderPayment);
router.get("/my-orders", protect, getUserOrders);
router.get("/:id", protect, getOrder);
router.put("/:id/cancel", protect, cancelOrder);

/* Admin routes */
router.get("/admin/all", protect, adminOnly, adminGetOrders);
router.get("/admin/stats", protect, adminOnly, adminStats);
router.put("/admin/:id/status", protect, adminOnly, adminUpdateOrderStatus);

export default router;
