import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  console.log("Generating token for userId:", userId);
  console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    throw new Error("JWT_SECRET is not defined");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  console.log("Token generated successfully:", token.substring(0, 20) + "...");

  // Updated cookie settings for production
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Allow cross-site cookies in production
    secure: process.env.NODE_ENV === "production", // Only secure in production
    path: "/", // Ensure cookie is available for all paths
  });

  console.log("Cookie set with settings:", {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    httpOnly: true,
    path: "/",
  });

  return token;
};
