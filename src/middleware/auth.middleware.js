import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("=== Auth Middleware Debug ===");
    console.log("Headers:", req.headers);
    console.log("Cookies:", req.cookies);

    // Check for token in Authorization header first, then cookies
    let token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

    if (!token) {
      token = req.cookies.jwt;
    }

    console.log("Token from headers/cookies: ", token);

    if (!token) {
      console.log("No token found in headers or cookies");
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    console.log(
      "Verifying token with JWT_SECRET exists:",
      !!process.env.JWT_SECRET
    );
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded);

    const user = await User.findById(decoded.userId).select("-password");
    console.log("User found:", !!user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};