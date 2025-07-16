import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";
import { validateUserName, censorMessage } from "../utils/messageCensorship.js";

// signup handler - handles both required and optional fields
export const signup = async (req, res) => {
  const { name, password, profile, fullName, email, gender, dateOfBirth } =
    req.body;
  try {
    // basic validation first
    if (!name || !password || !fullName) {
      return res
        .status(400)
        .json({ message: "Name, password, and full name are required" });
    }

    // Enhanced name validation using third-party libraries
    const nameValidation = validateUserName(name);
    if (!nameValidation.isValid) {
      return res.status(400).json({
        message: nameValidation.message,
        details: nameValidation.suggestions
          ? nameValidation.suggestions.join(". ")
          : "Please choose a different name",
        violations: nameValidation.violations,
      });
    }

    // password length check - might increase this later
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // check if username already taken
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: "name already exists" });
    }

    // Enhanced fullName validation - now required
    const fullNameValidation = validateUserName(fullName);
    if (!fullNameValidation.isValid) {
      return res.status(400).json({
        message: "Full name contains inappropriate language",
        details: fullNameValidation.suggestions
          ? fullNameValidation.suggestions.join(". ")
          : "Please choose a different full name",
        violations: fullNameValidation.violations,
      });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user with optional fields
    const newUser = new User({
      name,
      password: hashedPassword,
      profile,
      fullName: fullName,
      // these are optional - set to null if not provided
      email: email || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      // return user data (excluding password)
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        fullName: newUser.fullName,
        email: newUser.email,
        gender: newUser.gender,
        dateOfBirth: newUser.dateOfBirth,
        profile: newUser.profile,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const login = async (req, res) => {
  const { name, password } = req.body;
  try {
    console.log("Login attempt for name:", name);
    console.log("Database connection status:", mongoose.connection.readyState);

    // find user by username
    const user = await User.findOne({ name });
    console.log("User found:", user);

    if (!user) {
      // debugging - check if database has any users at all
      const userCount = await User.countDocuments();
      console.log("Total users in database:", userCount);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isPasswordCorrect);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log("Password match successful for user:", user._id);

    // generate JWT token after successful validation
    const token = generateToken(user._id, res);
    console.log("Token generated for user:", user._id);

    // send back user info with token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      profile: user.profile,
      token: token,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const logout = (req, res) => {
  try {
    console.log("Logout attempt - clearing JWT cookie");

    // Clear the JWT cookie properly
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    console.log("JWT cookie cleared successfully");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { profile } = req.body;
    const userId = req.user._id;

    if (!profile) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profile);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profile: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const updateUserInfo = async (req, res) => {
  try {
    const { fullName, email, gender, dateOfBirth } = req.body;
    const userId = req.user._id;

    // Enhanced fullName validation if provided
    if (fullName) {
      const fullNameValidation = validateUserName(fullName);
      if (!fullNameValidation.isValid) {
        return res.status(400).json({
          message: "Full name contains inappropriate language",
          details: fullNameValidation.suggestions
            ? fullNameValidation.suggestions.join(". ")
            : "Please choose a different full name",
          violations: fullNameValidation.violations,
        });
      }
    }

    // Create update object with only provided fields
    const updateData = {};

    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
