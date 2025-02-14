const mongoose = require("mongoose");

const RemarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  remarks: [
    {
      question: String,
      checked: Boolean,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Remark", RemarkSchema);
