const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bankAccountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  bankName: { type: String, required: true },
  accountHolderName: { type: String, required: true },
  upiId: { type: String },
  panCardNumber: { type: String, required: true },
  panCardPhoto: { type: String, required: true }, // File URL
  bankProof: { type: String, required: true }, // File URL
  amount: { type: Number, required: true }, // Withdrawal amount
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  submittedAt: { type: Date, default: Date.now },
});

const KYC = mongoose.model("KYC", kycSchema);
module.exports = KYC;
