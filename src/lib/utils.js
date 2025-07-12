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

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });

  console.log(
    "Cookie set with secure:",
    process.env.NODE_ENV !== "development"
  );
  return token;
};