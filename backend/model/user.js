const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      area: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
    },
    permanentAddress: {
      type: String,
    },
    aadharNumber: {
      type: String,
      unique: true,
      minlength: 12,
      maxlength: 12,
      validate: {
        validator: function (v) {
          return /^\d{12}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid Aadhar number! Must be 12 digits.`,
      },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["User", "Admin"], // Restrict to specific values
      default: "User",
    },
    businessCategory: {
      type: Array,
    },
    businessName: {
      type: String,
    },
    businessAddress: {
      type: String,
    },
    businessDetaile: {
      type: String,
    },
    frontAadhar: {
      type: String,
      // required: true,
      // trim: true,
    },
    backAadhar: {
      type: String,
      // required: true,
      // trim: true,
    },
    profilePic: {
      type: String,
      // required: true,
      // trim: true,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    isAdminApproved: { type: Boolean, default: false },
    userstatus: {
      type: String,
      enum: ["available", "unavailable"], // Allowed values
      default: "available", // Default value
    },
    sended_requests: [
      {
        user: {
          type: Object, // Store the full user object
          // type: mongoose.Schema.Types.ObjectId,
          // ref: "User",
          // required: true,
        },
        status: {
          type: String,
          enum: ["pending", "received", "canceled", "done", "completed"], // Allowed values
          default: "pending",
        },
        date: { type: Date, default: Date.now },
        providerrating: {
          value: { type: Number, min: 1, max: 10 }, // Rating value (1-10)
          comment: { type: String }, // Optional comment
          date: { type: Date, default: Date.now }, // Date of rating
        },
      },
    ],

    received_requests: [
      {
        user: {
          type: Object, // Store the full user object
          // type: mongoose.Schema.Types.ObjectId,
          // ref: "User",
          // required: true,
        },
        status: {
          type: String,
          enum: ["pending", "received", "canceled", "done", "completed"], // Allowed values
          default: "pending",
        },
        date: { type: Date, default: Date.now },
        userrating: {
          value: { type: Number, min: 1, max: 10 }, // Rating value (1-10)
          comment: { type: String }, // Optional comment
          date: { type: Date, default: Date.now }, // Date of rating
        },
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId, // User who gave the rating
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 10, // Restrict ratings between 1 and 5
        },
        comment: {
          type: String, // Optional feedback
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number, // Store the average rating for the user
      default: 0,
    },
    userRatings: [
      {
        rater: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 10,
        },
        comment: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    userAverageRating: {
      type: Number,
      default: 0,
    },

    // Ratings received as a provider
    providerRatings: [
      {
        rater: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 10,
        },
        comment: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    providerAverageRating: {
      type: Number,
      default: 0,
    },

    // New fields for referral system
    referralCode: { type: String, unique: true },
    referredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    earnings: { type: Number, default: 0 },
    walletBalance: {
      type: Number,
      default: 0,
    },
    earningsHistory: [
      {
        amount: {
          type: Number,
          required: true,
        },
        sourceUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          required: true,
        },
      },
    ],
    paymentHistory: [
      {
        paymentId: String, // Razorpay Payment ID
        orderId: String, // Razorpay Order ID or Payment Link ID
        amount: Number, // Amount paid
        currency: String, // Currency of the transaction
        status: String, // Payment status (e.g., "paid", "failed")
        createdAt: { type: Date, default: Date.now },
      },
    ],
    notifications: [
      {
        senderName: String,
        title: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    resetCode: { type: String }, // To store the reset code
    resetCodeExpires: { type: Number },
    paymentVerified: { type: Boolean, default: false }, // New field added
    paymentExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
