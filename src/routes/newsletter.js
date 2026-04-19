import { Router } from "express";
import {
  subscribe,
  unsubscribe,
  adminGetSubscribers,
  adminBroadcast,
} from "../controllers/newsletterController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

/* Public */
router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

/* Admin */
router.get("/admin/subscribers", protect, adminOnly, adminGetSubscribers);
router.post("/admin/broadcast", protect, adminOnly, adminBroadcast);

export default router;
