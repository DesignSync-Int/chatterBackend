import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getReceivedFriendRequests,
  getSentFriendRequests,
  getFriends,
  removeFriend,
  checkFriendshipStatus,
} from "../controllers/friendRequest.controller.js";

const router = express.Router();

// Send friend request
router.post("/send", protectRoute, sendFriendRequest);

// Accept friend request
router.put("/accept/:requestId", protectRoute, acceptFriendRequest);

// Decline friend request
router.put("/decline/:requestId", protectRoute, declineFriendRequest);

// Get received friend requests
router.get("/received", protectRoute, getReceivedFriendRequests);

// Get sent friend requests
router.get("/sent", protectRoute, getSentFriendRequests);

// Get friends list
router.get("/friends", protectRoute, getFriends);

// Remove friend
router.delete("/remove/:friendId", protectRoute, removeFriend);

// Check friendship status
router.get("/status/:userId", protectRoute, checkFriendshipStatus);

export default router;
