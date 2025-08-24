// Analytics and System Health Routes
// Provides endpoints for tracking user activity and monitoring system performance

import express from "express";
import {
  trackUserActivity,
  getApplicationMetrics,
  trackPerformanceMetrics,
  getSystemHealth,
} from "../controllers/analytics.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Track user activity (protected)
router.post("/activity", protectRoute, trackUserActivity);

// Track performance metrics (protected)
router.post("/performance", protectRoute, trackPerformanceMetrics);

// Get application metrics (protected - admin only)
router.get("/metrics", protectRoute, getApplicationMetrics);

// Public health check endpoint
router.get("/health", getSystemHealth);

// System status endpoint for monitoring
router.get("/status", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chatter API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

export default router;
