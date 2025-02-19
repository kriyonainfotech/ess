const admin = require("../config/firebase");
const User = require("../model/user");

// Endpoint to send notifications
const sendNotification = async ({
  senderName,
  fcmToken,
  title,
  message,
  receiverId,
}) => {
  if (!fcmToken || !title || !message || !senderName || !receiverId) {
    console.log("Error: Missing required parameters");
    return { success: false, error: "Missing required fields." };
  }

  try {
    const notificationPayload = {
      notification: {
        title: `${senderName} says: ${title}`,
        body: message,
      },
      token: fcmToken,
    };

    // Store notification directly in receiver's notifications array without fetching full document
    await User.updateOne(
      { _id: receiverId },
      {
        $push: {
          notifications: { senderName, title, message, timestamp: new Date() },
        },
      }
    );

    console.log(`Notification saved successfully for receiver: ${receiverId}`);

    // Send the notification using Firebase Cloud Messaging (FCM)
    const response = await admin.messaging().send(notificationPayload);
    console.log("FCM notification sent:", response);

    return { success: true, response };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: "Failed to send notification." };
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // Assume authentication middleware sets `req.user`
    console.log(userId, "userId");

    const user = await User.findById(userId).select("notifications");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Return the user's notifications
    return res.status(200).json({
      success: true,
      notifications: user.notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching notifications.",
      error: error.message,
    });
  }
};

const getNotificationsMobile = async (req, res) => {
  try {
    const { userId } = req.body; // Expecting userId from the request body

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Return the user's notifications
    return res.status(200).json({
      success: true,
      notifications: user.notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching notifications.",
      error: error.message,
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.body; // Get the notification ID from the route parameters

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Remove the notification from the user's notifications array
    user.notifications = user.notifications.filter(
      (notification) => notification._id.toString() !== notificationId
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the notification.",
      error: error.message,
    });
  }
};

module.exports = {
  sendNotification,
  getNotifications,
  deleteNotification,
  getNotificationsMobile,
};
