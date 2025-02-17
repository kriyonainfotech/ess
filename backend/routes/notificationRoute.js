const express = require("express");
const axios = require("axios");
const User = require("../model/user"); // Adjust the path based on your project structure
const router = express.Router();

// OneSignal App Credentials
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

router.post("/store-onesignal-id", async (req, res) => {
  try {
    const { userId, playerId } = req.body;
    await User.findByIdAndUpdate(userId, { oneSignalPlayerId: playerId });
    return res.json({ success: true, message: "OneSignal ID stored!" });
  } catch (error) {
    console.error("Error storing OneSignal ID:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Send Notification API
router.post("/send-notification", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Find sender and receiver in the database
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) {
      return res.status(404).json({ error: "User not found!" });
    }

    // Receiver's OneSignal Player ID
    const receiverPlayerId = receiver.oneSignalPlayerId;
    if (!receiverPlayerId) {
      return res.status(400).json({ error: "Receiver has no OneSignal ID!" });
    }

    // OneSignal notification payload
    const notificationData = {
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: [receiverPlayerId],
      headings: { en: "New Work Request" },
      contents: { en: `${sender.name} sent you a work request!` },
      data: { senderId: senderId, senderName: sender.name },
    };

    // Send notification via OneSignal API
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      notificationData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${ONESIGNAL_API_KEY}`,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Notification sent!",
      response: response.data,
    });
  } catch (error) {
    console.log("Error sending notification:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
