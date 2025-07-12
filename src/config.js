export const LocalPath =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL || "https://sachink.dev/chatter"
    : "http://localhost:5174";
