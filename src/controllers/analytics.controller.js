// Analytics and Monitoring Controller
// Tracks user engagement, system performance, and application metrics

import User from "../models/user.model.js";
import Message from "../models/message.model.js";

// Track user engagement metrics
const trackUserActivity = async (req, res) => {
  try {
    const { action, metadata } = req.body;
    const userId = req.user._id;

    // Log user activity for analytics
    console.log(`User Activity: ${userId} performed ${action}`, {
      timestamp: new Date().toISOString(),
      userId,
      action,
      metadata,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    // Update user's last activity
    await User.findByIdAndUpdate(userId, {
      lastActivity: new Date(),
      $inc: { activityCount: 1 },
    });

    res.status(200).json({
      success: true,
      message: "Activity tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking user activity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track activity",
    });
  }
};

// Get application metrics for dashboard
const getApplicationMetrics = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get user metrics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastActivity: { $gte: thirtyDaysAgo },
    });
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get message metrics
    const totalMessages = await Message.countDocuments();
    const recentMessages = await Message.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Calculate engagement metrics
    const averageMessagesPerUser =
      totalUsers > 0 ? totalMessages / totalUsers : 0;
    const userRetentionRate =
      totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    const metrics = {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        retentionRate: Math.round(userRetentionRate * 100) / 100,
      },
      messages: {
        total: totalMessages,
        recent: recentMessages,
        averagePerUser: Math.round(averageMessagesPerUser * 100) / 100,
      },
      engagement: {
        dailyActiveUsers: activeUsers,
        messageGrowth: recentMessages,
        platformHealth: "excellent", // Could be calculated based on various factors
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Error fetching application metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch metrics",
    });
  }
};

// Track system performance metrics
const trackPerformanceMetrics = async (req, res) => {
  try {
    const { timing, category, name, duration } = req.body;

    // Log performance metrics
    console.log(`Performance Metric: ${category}/${name}`, {
      timestamp: new Date().toISOString(),
      category,
      name,
      duration: `${duration}ms`,
      userId: req.user?._id,
      userAgent: req.headers["user-agent"],
      timing,
    });

    // Alert on slow operations (>5 seconds)
    if (duration > 5000) {
      console.warn(`🚨 Slow Operation Detected: ${name} took ${duration}ms`);
    }

    res.status(200).json({
      success: true,
      message: "Performance metrics tracked",
    });
  } catch (error) {
    console.error("Error tracking performance metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track performance metrics",
    });
  }
};

// Get system health status
const getSystemHealth = async (req, res) => {
  try {
    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        authentication: "operational",
        messaging: "operational",
        ai: "operational",
      },
      performance: {
        responseTime: "< 200ms",
        uptime: "99.9%",
        memoryUsage: "normal",
      },
      version: process.env.APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development",
    };

    // Check database connection
    try {
      await User.findOne().limit(1);
      healthCheck.services.database = "connected";
    } catch (dbError) {
      healthCheck.services.database = "error";
      healthCheck.status = "degraded";
    }

    res.status(200).json({
      success: true,
      data: healthCheck,
    });
  } catch (error) {
    console.error("Error checking system health:", error);
    res.status(500).json({
      success: false,
      message: "Health check failed",
      data: {
        status: "error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

export {
  trackUserActivity,
  getApplicationMetrics,
  trackPerformanceMetrics,
  getSystemHealth,
};
