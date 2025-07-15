import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { censorMessage } from "../utils/messageCensorship.js";

import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketIds } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const search = req.query.search || "";

    // build query object
    let query = { _id: { $ne: loggedInUserId } }; // exclude current user

    // add search filter if provided
    if (search.trim()) {
      query.name = { $regex: search, $options: "i" }; // case-insensitive search
    }

    // fetch all users (no pagination - lazy loading will handle rendering)
    const filteredUsers = await User.find(query)
      .select("-password")
      .sort({ name: 1 }); // alphabetical order

    // return all users for lazy loading
    res.status(200).json({
      users: filteredUsers,
      totalUsers: filteredUsers.length,
    });
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Check if users are friends before allowing to see messages
    const currentUser = await User.findById(myId);
    if (!currentUser.friends.includes(userToChatId)) {
      return res.status(403).json({ error: "You can only chat with friends" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, recipientId: userToChatId },
        { senderId: userToChatId, recipientId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { content, image } = req.body;
    const { id: recipientId } = req.params;
    const senderId = req.user._id;

    // Check if users are friends before allowing to send messages
    const currentUser = await User.findById(senderId);
    if (!currentUser.friends.includes(recipientId)) {
      return res
        .status(403)
        .json({ error: "You can only send messages to friends" });
    }

    // Apply censorship to message content
    if (content) {
      const censorshipResult = censorMessage(content);

      // Block extremely inappropriate content
      if (censorshipResult.shouldBlock) {
        return res.status(400).json({
          error: "Message blocked due to inappropriate content",
          details:
            "Your message contains content that violates our community guidelines",
        });
      }

      // Use censored content for the message
      req.body.content = censorshipResult.censoredText;
    }

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      recipientId,
      content: req.body.content,
      image: imageUrl,
    });
    console.log("New message here: ", newMessage);
    await newMessage.save();

    const receiverSocketId = getReceiverSocketIds(recipientId);
    console.log("Receiver socket ID: ", receiverSocketId, recipientId);
    if (receiverSocketId) {
      console.log("Emitting new message to receiver: ", receiverSocketId);
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
