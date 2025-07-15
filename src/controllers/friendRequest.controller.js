import FriendRequest from "../models/friendRequest.model.js";
import User from "../models/user.model.js";
import { io } from "../lib/socket.js";

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if they are already friends
    const isAlreadyFriend = await User.findOne({
      _id: senderId,
      friends: receiverId,
    });

    if (isAlreadyFriend) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    // Create friend request
    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
      message: message || "",
    });

    await friendRequest.save();

    // Populate sender information
    await friendRequest.populate("sender", "name profile");

    // Emit real-time notification to receiver
    io.to(receiverId.toString()).emit("friendRequestReceived", {
      _id: friendRequest._id,
      sender: friendRequest.sender,
      message: friendRequest.message,
      createdAt: friendRequest.createdAt,
    });

    res.status(201).json({
      message: "Friend request sent successfully",
      friendRequest,
    });
  } catch (error) {
    console.log("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const friendRequest = await FriendRequest.findById(requestId).populate("sender receiver", "name profile");

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.receiver._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({ message: "Friend request already processed" });
    }

    // Update friend request status
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each other as friends
    await User.findByIdAndUpdate(friendRequest.sender._id, {
      $addToSet: { friends: friendRequest.receiver._id },
    });

    await User.findByIdAndUpdate(friendRequest.receiver._id, {
      $addToSet: { friends: friendRequest.sender._id },
    });

    // Emit real-time notification to sender
    io.to(friendRequest.sender._id.toString()).emit("friendRequestAccepted", {
      _id: friendRequest._id,
      acceptedBy: friendRequest.receiver,
      createdAt: friendRequest.createdAt,
    });

    res.status(200).json({
      message: "Friend request accepted",
      friendRequest,
    });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Decline friend request
export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({ message: "Friend request already processed" });
    }

    // Update friend request status
    friendRequest.status = "declined";
    await friendRequest.save();

    res.status(200).json({
      message: "Friend request declined",
    });
  } catch (error) {
    console.log("Error in declineFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get received friend requests
export const getReceivedFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const friendRequests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "name profile").sort({ createdAt: -1 });

    res.status(200).json(friendRequests);
  } catch (error) {
    console.log("Error in getReceivedFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get sent friend requests
export const getSentFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const friendRequests = await FriendRequest.find({
      sender: userId,
      status: "pending",
    })
      .populate("receiver", "name profile")
      .sort({ createdAt: -1 });

    res.status(200).json(friendRequests);
  } catch (error) {
    console.log("Error in getSentFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get friends list
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("friends", "name profile");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    // Remove friend from both users
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    res.status(200).json({
      message: "Friend removed successfully",
    });
  } catch (error) {
    console.log("Error in removeFriend controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Check friendship status
export const checkFriendshipStatus = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user._id;

    // Check if they are friends
    const currentUser = await User.findById(currentUserId);
    const isFriend = currentUser.friends.includes(targetUserId);

    if (isFriend) {
      return res.status(200).json({ status: "friends" });
    }

    // Check for pending friend requests
    const pendingRequest = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: targetUserId, status: "pending" },
        { sender: targetUserId, receiver: currentUserId, status: "pending" },
      ],
    });

    if (pendingRequest) {
      const isRequestSender = pendingRequest.sender.toString() === currentUserId.toString();
      return res.status(200).json({
        status: "pending",
        requestType: isRequestSender ? "sent" : "received",
        requestId: pendingRequest._id,
      });
    }

    res.status(200).json({ status: "none" });
  } catch (error) {
    console.log("Error in checkFriendshipStatus controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
