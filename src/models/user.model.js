import mongoose from "mongoose";

// user schema with required and optional fields
const userSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    // optional profile fields - these can be null
    email: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          // skip validation if email is not provided
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    profile: {
      type: String,
      default: null, // avatar URL from cloudinary
    },
    // array of user IDs who are friends
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

const User = mongoose.model("User", userSchema);

export default User;
