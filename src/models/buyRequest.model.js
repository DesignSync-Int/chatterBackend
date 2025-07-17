import mongoose from "mongoose";

const buyRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },
    bestTimeToCall: {
      type: String,
      required: true,
      enum: ["morning", "afternoon", "evening", "anytime"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "completed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for efficient querying
buyRequestSchema.index({ createdAt: -1 });
buyRequestSchema.index({ status: 1 });
buyRequestSchema.index({ email: 1 });

const BuyRequest = mongoose.model("BuyRequest", buyRequestSchema);

export default BuyRequest;
