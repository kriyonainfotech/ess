
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../model/user");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const CreateOrder = async (req, res) => {
  try {
    // const userId = req.user.id;
    // const user = await User.findById(userId);

    // if (!user) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "User not found" });
    // }

    // const { amount } = req.body;
    const { amount } = req.body;

    // Check for missing fields
    if (!amount) {
      return res.status(400).send({
        success: false,
        message: "Please fill all the fields",
      });
    }


    const options = {
      amount: Number(amount) * 100, // Convert amount to paise (mandatory)
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"), // Generate a unique receipt ID
    };

    // Create the order using async/await (no need for callback)
    const order = await razorpayInstance.orders.create(options);

    const paymentLinkRequest = {
      amount: order.amount,
      // You can add customer details like:
      // customer: {
      //   name: user.name,
      //   email: user.email,
      // },
    };

    try {
      const paymentLink = await razorpayInstance.paymentLink.create(
        paymentLinkRequest
      );
      console.log(paymentLink, "pl");

      res.status(200).json({
        success: true,
        data: {
          order,
          payment_link: paymentLink.short_url, // Send the payment link URL
        },
      });

      console.log("Order:", order);
      console.log("Payment Link:", paymentLink.short_url);
    } catch (linkError) {
      console.error("Error creating payment link:", linkError);
      res.status(500).json({
        success: false,
        message: "Error creating payment link",
        error: linkError.message || "Unknown error",
      });
    }
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      success: false,
      message: error?.error?.description || "Failed to create payment link",
      error: error.message || "Unknown error",
    });
  }
};


// Controller to verify payment by fetching payment details using payment_id
const verifyPayment = async (req, res) => {
  try {
    const { payment_id, user_id } = req.body; // Ensure you receive user_id
     
    if (!payment_id) {
      return res
        .status(400)
        .json({ success: false, message: "Payment ID is required" });
    }

    // Fetch payment details from Razorpay using payment_id
    const paymentDetails = await razorpayInstance.payments.fetch(payment_id);
    if (!paymentDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }
 // If payment is authorized, capture it
 if (paymentDetails.status === "authorized") {
  try {
    const capturedPayment = await razorpayInstance.payments.capture(payment_id, paymentDetails.amount);
    // console.log("Captured Payment:", capturedPayment);
   
    return res.status(200).json({
      success: true,
      message: "Payment captured and verified successfully",
      paymentDetails: capturedPayment,
    });
  } catch (error) {
    console.error("Error capturing payment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to capture payment",
      error: error.message || "Unknown error",
    });
  }
}

    // Check if payment status is 'captured' (successful payment)
    if (paymentDetails.status === "captured") {
      // await User.findByIdAndUpdate(user_id, { paymentVerified: true });
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      await User.findByIdAndUpdate(user_id, {
        paymentVerified: true,
        paymentExpiry: expiryDate,
      });
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        paymentDetails,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment failed or not yet captured",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  CreateOrder,
  verifyPayment,
};
