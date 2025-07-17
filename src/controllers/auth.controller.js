import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";
import { validateUserName, censorMessage } from "../utils/messageCensorship.js";
import {
  checkLoginAttempts,
  recordFailedAttempt,
  clearLoginAttempts,
} from "../models/loginAttempt.model.js";

// signup handler - handles both required and optional fields
export const signup = async (req, res) => {
  const {
    name,
    password,
    profile,
    fullName,
    email,
    gender,
    dateOfBirth,
    captchaCompleted,
  } = req.body;
  try {
    // basic validation first
    if (!name || !password || !fullName) {
      return res
        .status(400)
        .json({ message: "Name, password, and full name are required" });
    }

    // Check if captcha was completed (frontend validation)
    if (!captchaCompleted) {
      return res
        .status(400)
        .json({ message: "Please complete the captcha verification" });
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
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const login = async (req, res) => {
  const { name, password } = req.body;
  try {
    const clientIp = req.clientIp || req.ip;

    // Check if login attempts are blocked
    const attemptCheck = await checkLoginAttempts(clientIp, name);
    if (attemptCheck.isBlocked) {
      return res.status(429).json({
        message: attemptCheck.message,
        retryAfter: attemptCheck.retryAfter,
      });
    }

    const user = await User.findOne({ name });

    if (!user) {
      // Record failed attempt for invalid user
      await recordFailedAttempt(clientIp, name);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      // Record failed attempt for wrong password
      await recordFailedAttempt(clientIp, name);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Clear login attempts on successful login
    await clearLoginAttempts(clientIp, name);

    const token = generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      profile: user.profile,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
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
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
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
    res.status(500).json({ message: "Internal server error" });
  }
};
