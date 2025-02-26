const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bankProof: { type: String, required: true }, // File URL
  bankDetails: {
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    accountHolderName: { type: String, required: true },
  },
  panCard: {
    number: { type: String, required: true },
    photo: { type: String, required: true }, // File URL
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  requestedAt: { type: Date, default: Date.now },
});

const WithdrawalRequest = mongoose.model("Withdrawal", withdrawalSchema);
module.exports = WithdrawalRequest;
