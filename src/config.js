export const LocalPath =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL || "https://chatterfrontend.onrender.com"
    : "http://localhost:5173";
