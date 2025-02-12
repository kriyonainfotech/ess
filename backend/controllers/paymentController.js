const Razorpay = require("razorpay");
const crypto = require("crypto");
const UserModel = require("../model/user");
// const { distributeReferralRewards } = require("./authController");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const CreateOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).send({
        success: false,
        message: "Please fill all the fields",
      });
    }

    const options = {
      amount: Number(amount) * 100, // Convert to paise
      currency: "INR", // In CreateOrder
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    try {
      const order = await razorpayInstance.orders.create(options);
      console.log("[INFO] Order created:", order);

      const paymentLinkRequest = {
        amount: order.amount,
        currency: "INR",
        accept_partial: false,
        description: "Registration Payment",
        customer: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9876543210",
        },
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
      };

      const paymentLink = await razorpayInstance.paymentLink.create(
        paymentLinkRequest
      );
      console.log("[INFO] Payment link created:", paymentLink);

      res.status(200).json({
        success: true,
        data: {
          order,
          payment_link: paymentLink.short_url,
        },
      });
    } catch (error) {
      console.error("[ERROR] Razorpay API error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating payment",
        error: error.message || "Unknown error",
        details: error.description || error.error?.description,
      });
    }
  } catch (error) {
    console.error("[ERROR] Server error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const distributeReferralRewards = async (newUserId, referrerId) => {
  console.log("[INFO] 💰 Distributing referral earnings...");
  const earningsDistribution = [20, 20, 15, 10]; // Rewards per referral level
  let currentReferrer = referrerId;
  let level = 0;

  while (currentReferrer && level < earningsDistribution.length) {
    const earningAmount = earningsDistribution[level];

    console.log(
      `[INFO] 💵 Level ${
        level + 1
      } - Giving ₹${earningAmount} to ${currentReferrer}`
    );

    await UserModel.updateOne(
      { _id: currentReferrer },
      {
        $inc: { earnings: earningAmount, walletBalance: earningAmount },
        $push: {
          earningsHistory: {
            amount: earningAmount,
            sourceUser: newUserId,
            type: "Referral Bonus",
            date: new Date(),
            level: level + 1,
          },
        },
      }
    );

    // Move to the next referrer (if exists)
    const referrerData = await UserModel.findById(currentReferrer).select(
      "referredBy"
    );
    currentReferrer = referrerData?.referredBy?.[0] || null;
    level++;
  }

  console.log("[INFO] ✅ Referral earnings distributed!");
};

// const distributeReferralRewards = async (newUserId, referrerId, session) => {
//   console.log("[INFO] 💰 Distributing referral earnings...");

//   const earningsDistribution = [20, 20, 15, 10]; // Rewards per referral level
//   let currentReferrer = referrerId;
//   let level = 0;

//   try {
//     while (currentReferrer && level < earningsDistribution.length) {
//       const earningAmount = earningsDistribution[level];

//       console.log(
//         `[INFO] 💵 Level ${level + 1} - Giving ₹${earningAmount} to ${currentReferrer}`
//       );

//       const updateResult = await UserModel.updateOne(
//         { _id: currentReferrer },
//         {
//           $inc: { earnings: earningAmount, walletBalance: earningAmount },
//           $push: {
//             earningsHistory: {
//               amount: earningAmount,
//               sourceUser: newUserId,
//               type: "Referral Bonus",
//               date: new Date(),
//               level: level + 1,
//             },
//           },
//         },
//         { session } // Ensure transaction safety
//       );

//       // If update fails, rollback and throw error
//       if (updateResult.modifiedCount === 0) {
//         throw new Error(`Failed to update rewards for user ${currentReferrer}`);
//       }

//       // Move to the next referrer (if exists)
//       const referrerData = await UserModel.findById(currentReferrer)
//         .select("referredBy")
//         .session(session);
//       currentReferrer = referrerData?.referredBy?.[0] || null;
//       level++;
//     }

//     console.log("[INFO] ✅ Referral earnings distributed!");
//   } catch (error) {
//     console.error("[ERROR] ❌ Failed to distribute rewards:", error.message);
//     throw error; // Ensures transaction rollback in `setReferral`
//   }
// };

const verifyPayment = async (req, res) => {
  try {
    const { payment_id, user_id } = req.body;
    if (!payment_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and User ID are required",
      });
    }

    const paymentDetails = await razorpayInstance.payments.fetch(payment_id);
    if (
      !paymentDetails ||
      (paymentDetails.status !== "authorized" &&
        paymentDetails.status !== "captured")
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment failed or not yet captured",
      });
    }

    if (paymentDetails.status === "authorized") {
      await razorpayInstance.payments.capture(
        payment_id,
        paymentDetails.amount
      );
    }

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const updatedUser = await UserModel.findByIdAndUpdate(
      user_id,
      { paymentVerified: true, paymentExpiry: expiryDate },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to update user payment status",
      });
    }

    // Distribute rewards only after payment is verified
    if (updatedUser.referredBy.length > 0) {
      console.log("[INFO] 🔄 User referred by:", updatedUser.referredBy[0]);

      await distributeReferralRewards(
        updatedUser._id,
        updatedUser.referredBy[0]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified, referral updated",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

module.exports = {
  CreateOrder,
  verifyPayment,
  distributeReferralRewards,
};
