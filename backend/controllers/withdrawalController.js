const wwithdrawalModel = require("../model/withdrawal");

const requestWithdrawal = async (req, res) => {
  try {
    const {
      userId,
      bankAccountNumber,
      ifscCode,
      bankName,
      accountHolderName,
      panCardNumber,
      amount,
    } = req.body;

    // Extract files from request
    const panCardPhoto = req.files?.panCardPhoto?.[0]?.path; // File URL
    const bankProof = req.files?.bankProof?.[0]?.path; // File URL

    if (!panCardPhoto || !bankProof) {
      return res
        .status(400)
        .json({ message: "Both panCardPhoto and bankProof are required." });
    }

    // Check if KYC already exists for the user
    let existingKYC = await KYC.findOne({ userId });
    if (existingKYC) {
      return res
        .status(400)
        .json({ message: "KYC details already submitted." });
    }

    // Save new KYC details with withdrawal amount
    const newKYC = new KYC({
      userId,
      bankAccountNumber,
      ifscCode,
      bankName,
      accountHolderName,
      panCardNumber,
      panCardPhoto,
      bankProof,
      amount, // Withdrawal amount
    });

    await newKYC.save();

    // Link KYC to User
    await UserModel.findByIdAndUpdate(userId, { kyc: newKYC._id });

    res.status(201).json({
      message: "Withdrawal request submitted successfully.",
      kyc: newKYC,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

const processUPIPayout = async (withdrawal) => {
  try {
    // Step 1: Create Contact (if not already created)
    const contact = await razorpay.contacts.create({
      name: withdrawal.user.name,
      email: withdrawal.user.email,
      contact: withdrawal.user.phone,
      type: "customer",
    });

    // Step 2: Create Fund Account for UPI
    const fundAccount = await razorpay.fundAccounts.create({
      contact_id: contact.id,
      account_type: "vpa",
      vpa: { address: withdrawal.upiId },
    });

    // Step 3: Create Payout
    const payout = await razorpay.payouts.create({
      account_number: "Your Razorpay Account",
      amount: withdrawal.amount * 100, // Convert to paise
      currency: "INR",
      mode: "UPI",
      purpose: "payout",
      fund_account_id: fundAccount.id,
      queue_if_low_balance: true, // Ensures payout is queued if insufficient balance
    });

    console.log("Payout Successful:", payout);
    return { success: true, payout };
  } catch (error) {
    console.error("Payout Failed:", error);
    return { success: false, error: error.message };
  }
};

const approveWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.body;

    // 1️⃣ Fetch Withdrawal Request
    const withdrawal = await Withdrawal.findById(withdrawalId).populate("user");
    if (!withdrawal)
      return res.status(404).json({ message: "Withdrawal not found." });
    if (withdrawal.status !== "pending")
      return res.status(400).json({ message: "Withdrawal already processed." });

    // 2️⃣ Fetch KYC Details (UPI ID)
    const kyc = await KYC.findOne({ user: withdrawal.user._id });
    if (!kyc || !kyc.upiId)
      return res
        .status(400)
        .json({ message: "KYC details not found or UPI ID missing." });

    // 3️⃣ Create Razorpay Contact
    const contact = await razorpay.contacts.create({
      name: withdrawal.user.name,
      email: withdrawal.user.email,
      contact: withdrawal.user.phone,
      type: "customer",
    });

    // 4️⃣ Create Fund Account for UPI
    const fundAccount = await razorpay.fundAccounts.create({
      contact_id: contact.id,
      account_type: "vpa",
      vpa: { address: kyc.upiId },
    });

    // 5️⃣ Create Razorpay Payout
    const payout = await razorpay.payouts.create({
      account_number: "Your Razorpay Account",
      amount: withdrawal.amount * 100, // Convert to paise
      currency: "INR",
      mode: "UPI",
      purpose: "payout",
      fund_account_id: fundAccount.id,
      queue_if_low_balance: true,
    });

    // 6️⃣ Update Withdrawal Status
    withdrawal.status = "approved";
    withdrawal.payoutId = payout.id;
    await withdrawal.save();

    // 7️⃣ Notify User
    // sendNotification(withdrawal.user._id, "Your withdrawal has been approved & processed!");

    res
      .status(200)
      .json({ message: "Withdrawal approved successfully.", payout });
  } catch (error) {
    console.error("Payout Error:", error);
    res
      .status(500)
      .json({ message: "Failed to process payout.", error: error.message });
  }
};

const approveBankWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.body;

    // 1️⃣ Fetch Withdrawal Request
    const withdrawal = await Withdrawal.findById(withdrawalId).populate("user");
    if (!withdrawal)
      return res.status(404).json({ message: "Withdrawal not found." });
    if (withdrawal.status !== "pending")
      return res.status(400).json({ message: "Withdrawal already processed." });

    // 2️⃣ Fetch KYC Details (Bank Info)
    const kyc = await KYC.findOne({ user: withdrawal.user._id });
    if (!kyc || !kyc.bankAccountNumber || !kyc.ifscCode)
      return res
        .status(400)
        .json({ message: "KYC details missing or incomplete." });

    // 3️⃣ Create Razorpay Contact
    const contact = await razorpay.contacts.create({
      name: withdrawal.user.name,
      email: withdrawal.user.email,
      contact: withdrawal.user.phone,
      type: "customer",
    });

    // 4️⃣ Create Fund Account for Bank Transfer
    const fundAccount = await razorpay.fundAccounts.create({
      contact_id: contact.id,
      account_type: "bank_account",
      bank_account: {
        name: kyc.accountHolderName,
        ifsc: kyc.ifscCode,
        account_number: kyc.bankAccountNumber,
      },
    });

    // 5️⃣ Create Razorpay Payout (IMPS Mode)
    const payout = await razorpay.payouts.create({
      account_number: "Your Razorpay Account",
      amount: withdrawal.amount * 100, // Convert to paise
      currency: "INR",
      mode: "IMPS", // Can be "IMPS", "NEFT", or "RTGS"
      purpose: "payout",
      fund_account_id: fundAccount.id,
      queue_if_low_balance: true,
    });

    // 6️⃣ Update Withdrawal Status
    withdrawal.status = "approved";
    withdrawal.payoutId = payout.id;
    await withdrawal.save();

    // 7️⃣ Notify User
    // sendNotification(withdrawal.user._id, "Your bank withdrawal has been approved & processed!");

    res
      .status(200)
      .json({ message: "Bank withdrawal approved successfully.", payout });
  } catch (error) {
    console.error("Payout Error:", error);
    res.status(500).json({
      message: "Failed to process bank payout.",
      error: error.message,
    });
  }
};

// 2️⃣ GET /withdrawal/history → Fetch user withdrawal history
// router.get("/withdrawal/history", async (req, res) => {
//   try {
//     const { userId } = req.query;
//     const history = await Withdrawal.find({ userId }).sort({ requestedAt: -1 });
//     res.json(history);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// 3️⃣ GET /admin/withdrawals → Admin view of pending withdrawals
// router.get("/admin/withdrawals", async (req, res) => {
//   try {
//     const pendingWithdrawals = await Withdrawal.find({ status: "pending" });
//     res.json(pendingWithdrawals);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// 4️⃣ POST /admin/withdrawal/approve → Approve & trigger Razorpay payout
// router.post("/admin/withdrawal/approve", async (req, res) => {
//   try {
//     const { withdrawalId } = req.body;
//     const withdrawal = await Withdrawal.findById(withdrawalId).populate(
//       "userId"
//     );
//     if (!withdrawal)
//       return res.status(404).json({ message: "Withdrawal not found" });

//     if (withdrawal.status !== "pending") {
//       return res.status(400).json({ message: "Already processed" });
//     }

//     const kyc = await KYC.findOne({ userId: withdrawal.userId._id });
//     if (!kyc) return res.status(400).json({ message: "KYC details missing" });

//     const payout = await razorpay.payouts.create({
//       account_number: process.env.RAZORPAY_ACCOUNT,
//       amount: withdrawal.amount * 100,
//       currency: "INR",
//       mode: "IMPS",
//       purpose: "payout",
//       fund_account: {
//         account_type: "bank_account",
//         bank_account: {
//           name: kyc.bankDetails.accountHolderName,
//           ifsc: kyc.bankDetails.ifscCode,
//           account_number: kyc.bankDetails.accountNumber,
//         },
//         contact: {
//           name: withdrawal.userId.name,
//           type: "customer",
//           email: withdrawal.userId.email,
//           phone: withdrawal.userId.phone,
//         },
//       },
//     });

//     withdrawal.status = "approved";
//     await withdrawal.save();
//     res.json({ message: "Payout successful", payout });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

module.exports = {
  requestWithdrawal,
  processUPIPayout,
  approveWithdrawal,
  approveBankWithdrawal,
};
