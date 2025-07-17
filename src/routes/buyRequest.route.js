import express from "express";
import {
  createBuyRequest,
  getAllBuyRequests,
  updateBuyRequestStatus,
  getBuyRequestById,
  deleteBuyRequest
} from "../controllers/buyRequest.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { buyRequestRateLimit } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

// Public route - anyone can submit a buy request (with rate limiting)
router.post("/", buyRequestRateLimit, createBuyRequest);

// Protected routes - for admin use (future implementation)
router.get("/", protectRoute, getAllBuyRequests);
router.get("/:requestId", protectRoute, getBuyRequestById);
router.put("/:requestId", protectRoute, updateBuyRequestStatus);
router.delete("/:requestId", protectRoute, deleteBuyRequest);

export default router;
