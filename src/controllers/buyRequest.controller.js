import BuyRequest from "../models/buyRequest.model.js";
import { censorMessage } from "../utils/messageCensorship.js";

// Create a new buy request
export const createBuyRequest = async (req, res) => {
  try {
    const { name, contactNumber, email, bestTimeToCall, description } = req.body;

    // Validate required fields
    if (!name || !contactNumber || !email || !bestTimeToCall || !description) {
      return res.status(400).json({
        message: "All fields are required",
        details: "Please provide name, contact number, email, best time to call, and description"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    // Validate contact number format
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(contactNumber)) {
      return res.status(400).json({
        message: "Please enter a valid contact number"
      });
    }

    // Validate best time to call
    const validTimes = ["morning", "afternoon", "evening", "anytime"];
    if (!validTimes.includes(bestTimeToCall)) {
      return res.status(400).json({
        message: "Please select a valid time to call"
      });
    }

    // Validate description
    if (description.trim().length < 10) {
      return res.status(400).json({
        message: "Description must be at least 10 characters long"
      });
    }

    if (description.trim().length > 1000) {
      return res.status(400).json({
        message: "Description cannot exceed 1000 characters"
      });
    }

    // Check for duplicate requests from same email within 24 hours
    const existingRequest = await BuyRequest.findOne({
      email: email.toLowerCase(),
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingRequest) {
      return res.status(429).json({
        message: "You have already submitted a request within the last 24 hours. Please wait before submitting another request."
      });
    }

    // Apply censorship to name (basic protection)
    const censoredName = censorMessage(name);
    if (censoredName.shouldBlock) {
      return res.status(400).json({
        message: "Name contains inappropriate content. Please use a different name."
      });
    }

    // Apply censorship to description (basic protection)
    const censoredDescription = censorMessage(description);
    if (censoredDescription.shouldBlock) {
      return res.status(400).json({
        message: "Description contains inappropriate content. Please revise your description."
      });
    }

    // Create the buy request
    const buyRequest = new BuyRequest({
      name: censoredName.censoredText,
      contactNumber: contactNumber.trim(),
      email: email.toLowerCase().trim(),
      bestTimeToCall,
      description: censoredDescription.censoredText,
      status: "pending"
    });

    await buyRequest.save();

    console.log("New buy request created:", {
      id: buyRequest._id,
      name: buyRequest.name,
      email: buyRequest.email,
      bestTimeToCall: buyRequest.bestTimeToCall,
      createdAt: buyRequest.createdAt
    });

    res.status(201).json({
      message: "Buy request submitted successfully",
      requestId: buyRequest._id,
      status: "pending"
    });

  } catch (error) {
    console.error("Error creating buy request:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Validation failed",
        details: validationErrors.join(", ")
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A request with this information already exists"
      });
    }

    res.status(500).json({
      message: "Internal server error. Please try again later."
    });
  }
};

// Get all buy requests (admin only - for future use)
export const getAllBuyRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = {};
    if (status) {
      query.status = status;
    }

    const buyRequests = await BuyRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const total = await BuyRequest.countDocuments(query);

    res.status(200).json({
      buyRequests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error("Error fetching buy requests:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Update buy request status (admin only - for future use)
export const updateBuyRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["pending", "contacted", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const buyRequest = await BuyRequest.findByIdAndUpdate(
      requestId,
      {
        status,
        notes: notes || ""
      },
      { new: true }
    );

    if (!buyRequest) {
      return res.status(404).json({
        message: "Buy request not found"
      });
    }

    res.status(200).json({
      message: "Buy request updated successfully",
      buyRequest
    });

  } catch (error) {
    console.error("Error updating buy request:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get buy request by ID
export const getBuyRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;

    const buyRequest = await BuyRequest.findById(requestId).select("-__v");

    if (!buyRequest) {
      return res.status(404).json({
        message: "Buy request not found"
      });
    }

    res.status(200).json(buyRequest);

  } catch (error) {
    console.error("Error fetching buy request:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Delete buy request (admin only - for future use)
export const deleteBuyRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const buyRequest = await BuyRequest.findByIdAndDelete(requestId);

    if (!buyRequest) {
      return res.status(404).json({
        message: "Buy request not found"
      });
    }

    res.status(200).json({
      message: "Buy request deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting buy request:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};
