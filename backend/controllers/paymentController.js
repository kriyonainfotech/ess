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

// const verifyPayment = async (req, res) => {
//   try {
//     const { payment_id, user_id } = req.body;
//     console.log("🔹 [INFO] Received payment verification request.");
//     console.log("🔹 Payment ID:", payment_id);
//     console.log("🔹 User ID:", user_id);

//     if (!payment_id || !user_id) {
//       console.log("🔴 [ERROR] Missing payment_id or user_id.");
//       return res.status(400).json({
//         success: false,
//         message: "Payment ID and User ID are required",
//       });
//     }

//     // Fetch payment details from Razorpay
//     const paymentDetails = await razorpayInstance.payments.fetch(payment_id);
//     console.log("🟢 [INFO] Payment details fetched:", paymentDetails);

//     if (!paymentDetails) {
//       console.log("🔴 [ERROR] Payment not found.");
//       return res.status(404).json({
//         success: false,
//         message: "Payment not found",
//       });
//     }

//     if (paymentDetails.status === "authorized") {
//       try {
//         console.log("🟡 [INFO] Payment authorized, capturing...");
//         const capturedPayment = await razorpayInstance.payments.capture(
//           payment_id,
//           paymentDetails.amount
//         );

//         console.log("🟢 [INFO] Payment captured:", capturedPayment.id);

//         // Update user payment status
//         const expiryDate = new Date();
//         expiryDate.setFullYear(expiryDate.getFullYear() + 1);

//         const updatedUser = await User.findByIdAndUpdate(
//           user_id,
//           { paymentVerified: true, paymentExpiry: expiryDate },
//           { new: true }
//         );

//         if (!updatedUser) {
//           console.log("🔴 [ERROR] Failed to update user payment status.");
//           throw new Error("Failed to update user payment status");
//         }

//         console.log("🟢 [INFO] User payment status updated:", updatedUser._id);

//         return res.status(200).json({
//           success: true,
//           message: "Payment captured and verified successfully",
//           paymentDetails: capturedPayment,
//           user: {
//             paymentVerified: updatedUser.paymentVerified,
//             paymentExpiry: updatedUser.paymentExpiry,
//           },
//         });
//       } catch (error) {
//         console.error("🔴 [ERROR] Payment capture/update failed:", error);
//         return res.status(500).json({
//           success: false,
//           message: "Failed to capture payment or update user status",
//           error: error.message,
//         });
//       }
//     }

//     if (paymentDetails.status === "captured") {
//       console.log(
//         "🟢 [INFO] Payment already captured. Updating user status..."
//       );
//       const expiryDate = new Date();
//       expiryDate.setFullYear(expiryDate.getFullYear() + 1);

//       const updatedUser = await User.findByIdAndUpdate(
//         user_id,
//         { paymentVerified: true, paymentExpiry: expiryDate },
//         { new: true }
//       );

//       if (!updatedUser) {
//         console.log("🔴 [ERROR] Failed to update user payment status.");
//         throw new Error("Failed to update user payment status");
//       }

//       console.log("🟢 [INFO] User payment status updated:", updatedUser._id);

//       return res.status(200).json({
//         success: true,
//         message: "Payment verified successfully",
//         paymentDetails,
//         user: {
//           paymentVerified: updatedUser.paymentVerified,
//           paymentExpiry: updatedUser.paymentExpiry,
//         },
//       });
//     }

//     console.log("🔴 [ERROR] Payment failed or not yet captured.");
//     return res.status(400).json({
//       success: false,
//       message: "Payment failed or not yet captured",
//     });
//   } catch (error) {
//     console.error("🔴 [ERROR] Payment verification failed:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error verifying payment",
//       error: error.message,
//     });
//   }
// };

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
};
