const User = require("../model/user"); // Update the path as needed
const mongoose = require("mongoose");
// const { sendNotification } = require("../config/firebase");

const sentRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !senderId) {
      return res.status(400).send({
        success: false,
        message: "Sender or receiver ID is missing.",
      });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).send({
        success: false,
        message: "You cannot send a request to yourself.",
      });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }
    const existingSentRequest = sender.sended_requests.find(
      (req) => req.user.toString() === receiverId && req.status === "pending"
    );

    if (existingSentRequest) {
      return res.status(400).send({
        success: false,
        message: "Already send request.",
      });
    }

    // Check if a pending request already exists from receiver to sender
    const existingReceivedRequest = receiver.received_requests.find(
      (req) => req.user.toString() === senderId && req.status === "pending"
    );

    if (existingReceivedRequest) {
      return res.status(400).send({
        success: false,
        message: "Already send request.",
      });
    }

    await User.findByIdAndUpdate(senderId, {
      $addToSet: { sended_requests: { user: receiver, status: "pending" } },
    });

    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { received_requests: { user: sender, status: "pending" } },
    });
    // console.log(receiver._id,"seder token");

    const Notification = {
      senderName: sender.name,
      fcmToken: receiver.fcmToken,
      title: "New work",
      message: `${sender.name} has sent you a request.`,
      receiverId: receiver._id, // Include the receiver's ID to store the notification
    };
    // console.log(Notification,"notif" );

    await sendNotification(Notification);

    const updatedSender = await User.findById(senderId).populate(
      "sended_requests.user"
    );
    const updatedReceiver = await User.findById(receiverId).populate(
      "received_requests.user"
    );

    return res.status(200).send({
      success: true,
      message: "Request sent successfully.",
      sender: updatedSender,
      receiver: updatedReceiver,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during the request.",
      error: error.message,
    });
  }
};

// Function to send FCM Notification
// const sendNotification = async ({ fcmToken, title, message }) => {
//   if (!fcmToken) {
//     console.error("FCM token is missing. Notification not sent.");
//     return;
//   }

//   const payload = {
//     token: fcmToken,
//     notification: {
//       title,
//       body: message,
//     },
//     data: { click_action: "FLUTTER_NOTIFICATION_CLICK" }, // Optional custom data
//   };

//   try {
//     await admin.messaging().send(payload);
//     console.log("Notification sent successfully:", title);
//   } catch (error) {
//     console.error("Error sending notification:", error);
//   }
// };

// Send Request Function
// const sentRequest = async (req, res) => {
//   try {
//     const { receiverId } = req.body;
//     const senderId = req.user.id;

//     if (!receiverId || !senderId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Sender or receiver ID is missing." });
//     }

//     if (senderId.toString() === receiverId) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot send a request to yourself.",
//       });
//     }

//     const sender = await User.findById(senderId);
//     const receiver = await User.findById(receiverId);

//     if (!sender || !receiver) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Sender or receiver not found." });
//     }

//     // Check if a pending request already exists
//     const existingSentRequest = sender.sended_requests.find(
//       (req) => req.user.toString() === receiverId && req.status === "pending"
//     );
//     const existingReceivedRequest = receiver.received_requests.find(
//       (req) => req.user.toString() === senderId && req.status === "pending"
//     );

//     if (existingSentRequest || existingReceivedRequest) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Request already sent." });
//     }

//     // Update sender and receiver requests
//     await User.findByIdAndUpdate(senderId, {
//       $addToSet: { sended_requests: { user: receiver, status: "pending" } },
//     });
//     await User.findByIdAndUpdate(receiverId, {
//       $addToSet: { received_requests: { user: sender, status: "pending" } },
//     });

//     // Send FCM Notification
//     if (receiver.fcmToken) {
//       await sendNotification({
//         fcmToken: receiver.fcmToken,
//         title: "New Work Request",
//         message: `${sender.name} has sent you a request.`,
//       });
//     } else {
//       console.warn("Receiver does not have an FCM token.");
//     }

//     const updatedSender = await User.findById(senderId).populate(
//       "sended_requests.user"
//     );
//     const updatedReceiver = await User.findById(receiverId).populate(
//       "received_requests.user"
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Request sent successfully.",
//       sender: updatedSender,
//       receiver: updatedReceiver,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred during the request.",
//       error: error.message,
//     });
//   }
// };

// const sentRequestMobile = async (req, res) => {
//   try {
//     console.log("🔵 Received request to send a request:", req.body);

//     const { senderId, receiverId } = req.body;

//     if (!senderId || !receiverId) {
//       console.log("❌ Missing sender or receiver ID.");
//       return res.status(400).send({
//         success: false,
//         message: "Sender or receiver ID is missing.",
//       });
//     }

//     if (senderId === receiverId) {
//       console.log("⚠️ Sender and receiver IDs are the same.");
//       return res.status(400).send({
//         success: false,
//         message: "You cannot send a request to yourself.",
//       });
//     }

//     console.log("🔍 Fetching sender and receiver details...");
//     const sender = await User.findById(senderId).select("_id");
//     const receiver = await User.findById(receiverId).select("_id");

//     if (!sender || !receiver) {
//       console.log("❌ Sender or receiver not found.");
//       return res.status(404).send({
//         success: false,
//         message: "Sender or receiver not found.",
//       });
//     }

//     console.log("📌 Checking if a request already exists...");

//     // Check if sender has already sent a pending request to receiver
//     const existingSentRequest = sender.sended_requests.find(
//       (req) => req.user.toString() === receiverId && req.status === "pending"
//     );

//     // Check if receiver has already received a pending request from sender
//     const existingReceivedRequest = receiver.received_requests.find(
//       (req) => req.user.toString() === senderId && req.status === "pending"
//     );

//     if (existingSentRequest || existingReceivedRequest) {
//       console.log("⚠️ Request already exists. Blocking duplicate request.");
//       return res.status(400).send({
//         success: false,
//         message: "Request already sent.",
//       });
//     }

//     console.log("✅ Request is new. Proceeding with update...");

//     // Add request to sender's sent list
//     console.log(`📤 Updating sender (${senderId}) sended_requests...`);
//     await User.findByIdAndUpdate(senderId, {
//       $addToSet: { sended_requests: { user: receiver._id, status: "pending" } },
//     });

//     // Add request to receiver's received list
//     console.log(`📥 Updating receiver (${receiverId}) received_requests...`);
//     await User.findByIdAndUpdate(receiverId, {
//       $addToSet: { received_requests: { user: sender._id, status: "pending" } },
//     });

//     // Sending notification if receiver has an FCM token
//     if (receiver.fcmToken) {
//       console.log("📩 Sending push notification...");
//       const Notification = {
//         senderName: sender.name,
//         fcmToken: receiver.fcmToken,
//         title: "New Work",
//         message: `${sender.name} has sent you a request.`,
//         receiverId: receiver._id,
//       };

//       await sendNotification(Notification);
//       console.log("✅ Notification sent successfully.");
//     } else {
//       console.log("⚠️ Receiver has no FCM token. Skipping notification.");
//     }

//     console.log("🎉 Request sent successfully!");

//     return res.status(200).send({
//       success: true,
//       message: "Request sent successfully.",
//       sender,
//       receiver,
//     });
//   } catch (error) {
//     console.error("❌ Error in request process:", error);
//     return res.status(500).send({
//       success: false,
//       message: "An error occurred during the request.",
//       error: error.message,
//     });
//   }
// };
const sentRequestMobile = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    console.log("🔍 Fetching sender and receiver details...");

    if (!senderId || !receiverId) {
      return res.status(400).send({
        success: false,
        message: "Sender or receiver ID is missing.",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).send({
        success: false,
        message: "You cannot send a request to yourself.",
      });
    }

    // Fetch only _id fields
    const sender = await User.findById(senderId).select("_id name");
    const receiver = await User.findById(receiverId).select("_id name");

    // Debugging the fetched users
    console.log("📌 Sender:", sender);
    console.log("📌 Receiver:", receiver);
    console.log("🔍 Fetching sender and receiver details...");

    // Check if sender exists
    if (!sender) {
      console.error("❌ Sender not found!");
      return res.status(404).send({
        success: false,
        message: "Sender not found.",
      });
    }

    // Ensure sender.sended_requests is an array
    if (!Array.isArray(sender.sended_requests)) {
      console.warn(
        "⚠️ 'sended_requests' not found. Initializing as an empty array."
      );
      sender.sended_requests = []; // Initialize it if missing
    }

    console.log("📌 Sender's sent requests:", sender.sended_requests);
    console.log("📌 Receiver ID:", receiverId);

    // Check if a pending request already exists
    const existingSentRequest = sender.sended_requests.find((req) => {
      console.log("📌 Checking request:", req);
      console.log(
        "📌 Condition being checked:",
        req.user.toString(),
        receiverId,
        req.status === "pending"
      );
      return req.user.toString() === receiverId && req.status === "pending";
    });

    if (existingSentRequest) {
      console.log("❌ Already sent request.");
      return res.status(400).send({
        success: false,
        message: "Already sent request.",
      });
    }

    // Proceed with request sending...
    console.log("✅ No existing request found. Proceeding to send request...");

    // Check if receiver exists
    if (!receiver) {
      console.error("❌ Receiver not found!");
      return res.status(404).send({
        success: false,
        message: "Receiver not found.",
      });
    }

    // Ensure receiver.received_requests is an array
    if (!Array.isArray(receiver.received_requests)) {
      console.warn(
        "⚠️ 'received_requests' not found. Initializing as an empty array."
      );
      receiver.received_requests = [];
    }

    console.log("📌 Receiver's received requests:", receiver.received_requests);
    console.log("📌 Sender ID:", senderId);

    // Check if a pending request already exists from receiver to sender
    const existingReceivedRequest = receiver.received_requests.find((req) => {
      console.log("📌 Checking received request:", req);
      console.log(
        "📌 Condition being checked:",
        req.user.toString(),
        senderId,
        req.status === "pending"
      );
      return req.user.toString() === senderId && req.status === "pending";
    });

    if (existingReceivedRequest) {
      console.log("❌ Already received a request from this sender.");
      return res.status(400).send({
        success: false,
        message: "Already sent request.",
      });
    }

    // Proceed with request sending...
    console.log("✅ No existing request found. Proceeding to send request...");

    console.log("📌 Adding request to both users...");
    await User.findByIdAndUpdate(senderId, {
      $addToSet: { sended_requests: { user: receiver, status: "pending" } },
    });

    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { received_requests: { user: sender, status: "pending" } },
    });

    console.log("📌 Sending notification...");

    const Notification = {
      senderName: sender.name,
      fcmToken: receiver.fcmToken,
      title: "New Work",
      message: `${sender.name} has sent you a request.`,
      receiverId: receiver._id, // Include the receiver's ID to store the notification
    };
    console.log("🔵 Notification:", Notification);
    // await sendNotification(Notification);

    return res.status(200).send({
      success: true,
      message: "Request sent successfully.",
      sender,
      receiver,
    });
  } catch (error) {
    console.error("❌ Error in request process:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during the request.",
      error: error.message,
    });
  }
};

const sendRequestNotification = async (userId, title, message) => {
  try {
    const user = await User.findById(userId);
    if (user && user.fcmToken) {
      await sendNotification(user.fcmToken, title, message);
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const receivedRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user.id;

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const sender = await User.findById(senderObjectId);
    const receiver = await User.findById(receiverObjectId);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    const senderUpdateResult = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      {
        $set: {
          "sended_requests.$.status": "received",
          userstatus: "unavailable",
        },
      }
    );

    if (senderUpdateResult.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "No matching request found in sender's sended_requests.",
      });
    }

    const receiverUpdateResult = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      {
        $set: {
          "received_requests.$.status": "received",
          userstatus: "unavailable",
        },
      }
    );

    if (receiverUpdateResult.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "No matching request found in receiver's received_requests.",
      });
    }

    // Send notification to sender
    await sendRequestNotification(
      senderId,
      "Request Received",
      `${receiver.name} has received your request`
    );

    return res.status(200).send({
      success: true,
      message: "Request received Successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while updating the request.",
      error: error.message,
    });
  }
};

const receivedRequestMobile = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body; // receiverId and senderId provided in request body

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const sender = await User.findById(senderObjectId);
    const receiver = await User.findById(receiverObjectId);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    const senderUpdateResult = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      {
        $set: {
          "sended_requests.$.status": "received",
          userstatus: "unavailable",
        },
      }
    );

    if (senderUpdateResult.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "No matching request found in sender's sended_requests.",
      });
    }

    const receiverUpdateResult = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      {
        $set: {
          "received_requests.$.status": "received",
          userstatus: "unavailable",
        },
      }
    );

    if (receiverUpdateResult.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "No matching request found in receiver's received_requests.",
      });
    }

    // Send notification to the sender that their request was received
    const Notification = {
      senderName: receiver.name,
      fcmToken: sender.fcmToken,
      title: "Request Received",
      message: `${receiver.name} has received your request.`,
      receiverId: sender._id, // Include the receiver's ID to store the notification
    };

    await sendNotification(Notification);

    return res.status(200).send({
      success: true,
      message:
        "Request status updated to 'received', and both sender and receiver's userstatus set to 'unavailable'.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while updating the request.",
      error: error.message,
    });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user.id;

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const [sender, receiver] = await Promise.all([
      User.findById(senderObjectId),
      User.findById(receiverObjectId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    const senderStatusUpdate = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      { $set: { "sended_requests.$.status": "canceled" } }
    );

    if (senderStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in sender's sended_requests to update status.",
      });
    }

    const receiverStatusUpdate = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      { $set: { "received_requests.$.status": "canceled" } }
    );

    if (receiverStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in receiver's received_requests to update status.",
      });
    }

    const senderRequestRemoval = await User.updateOne(
      { _id: senderObjectId },
      { $pull: { sended_requests: { "user._id": receiverObjectId } } }
    );

    if (senderRequestRemoval.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to remove request from sender's sended_requests.",
      });
    }

    const receiverRequestRemoval = await User.updateOne(
      { _id: receiverObjectId },
      { $pull: { received_requests: { "user._id": senderObjectId } } }
    );

    if (receiverRequestRemoval.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to remove request from receiver's received_requests.",
      });
    }

    // Send notification to both parties
    await sendRequestNotification(
      senderId,
      "Request Cancelled",
      `Your request with ${receiver.name} has been cancelled`
    );

    await sendRequestNotification(
      receiverId,
      "Request Cancelled",
      `Request from ${sender.name} has been cancelled`
    );

    return res.status(200).send({
      success: true,
      message: "Request cancelled successfully",
    });
  } catch (error) {
    console.error("Error during request cancellation:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during cancellation.",
      error: error.message,
    });
  }
};

const cancelRequestMobile = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body; // receiverId and senderId provided in request body

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const [sender, receiver] = await Promise.all([
      User.findById(senderObjectId),
      User.findById(receiverObjectId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    const senderStatusUpdate = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      { $set: { "sended_requests.$.status": "canceled" } }
    );

    if (senderStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in sender's sended_requests to update status.",
      });
    }

    const receiverStatusUpdate = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      { $set: { "received_requests.$.status": "canceled" } }
    );

    if (receiverStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in receiver's received_requests to update status.",
      });
    }

    const senderRequestRemoval = await User.updateOne(
      { _id: senderObjectId },
      { $pull: { sended_requests: { "user._id": receiverObjectId } } }
    );

    if (senderRequestRemoval.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to remove request from sender's sended_requests.",
      });
    }

    const receiverRequestRemoval = await User.updateOne(
      { _id: receiverObjectId },
      { $pull: { received_requests: { "user._id": senderObjectId } } }
    );

    if (receiverRequestRemoval.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to remove request from receiver's received_requests.",
      });
    }

    // Send notification to both sender and receiver that the request is canceled
    await sendNotification({
      senderName: sender.name,
      fcmToken: receiver.fcmToken,
      title: "Request Canceled",
      message: `${sender.name} has canceled the request.`,
      receiverId: receiver._id,
    });

    await sendNotification({
      senderName: receiver.name,
      fcmToken: sender.fcmToken,
      title: "Request Canceled",
      message: `${receiver.name} has canceled the request.`,
      receiverId: sender._id,
    });

    return res.status(200).send({
      success: true,
      message: "Request status updated to 'canceled' and removed successfully.",
    });
  } catch (error) {
    console.error("Error during request cancellation:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during cancellation.",
      error: error.message,
    });
  }
};

const updateUserAverageRating = async (userId, newRating) => {
  const user = await User.findById(userId);

  if (user) {
    const allRatings = user.userRatings.map((r) => r.rating);
    allRatings.push(newRating);

    const average =
      allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;

    await User.updateOne(
      { _id: userId },
      { $set: { userAverageRating: average } }
    );
  }
};

const updateProviderAverageRating = async (userId, newRating) => {
  const user = await User.findById(userId);

  if (user) {
    const allRatings = user.providerRatings.map((r) => r.rating);
    allRatings.push(newRating);

    const average =
      allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;

    await User.updateOne(
      { _id: userId },
      { $set: { providerAverageRating: average } }
    );
  }
};

const workDone = async (req, res) => {
  try {
    const { senderId, rating, comment } = req.body; // Rating and comment from request body
    const receiverId = req.user.id;

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const [sender, receiver] = await Promise.all([
      User.findById(senderObjectId),
      User.findById(receiverObjectId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    // Update sender's sended_requests: set status to 'done' and add rating
    const senderStatusUpdate = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      {
        $set: {
          "sended_requests.$.status": "done",
        },
      }
    );

    if (senderStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in sender's sended_requests to update status.",
      });
    }

    // Update receiver's received_requests: set status to 'done' and add rating
    const receiverStatusUpdate = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      {
        $set: {
          "received_requests.$.status": "done",
          "received_requests.$.userrating": {
            value: rating,
            comment: comment,
            date: Date.now(),
          },
        },
      }
    );

    if (receiverStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in receiver's received_requests to update status.",
      });
    }

    // Update receiver's status to 'available'
    const receiverStatusUpdateResult = await User.updateOne(
      { _id: receiverObjectId },
      { $set: { userstatus: "available" } }
    );

    if (receiverStatusUpdateResult.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to update receiver's user status to 'available'.",
      });
    }
    // Update sender's status to 'available'
    const senderStatusUpdateResult = await User.updateOne(
      { _id: senderObjectId },
      { $set: { userstatus: "available" } }
    );

    if (senderStatusUpdateResult.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to update receiver's user status to 'available'.",
      });
    }

    // Calculate and update averages
    await updateUserAverageRating(receiverId, rating); // Update receiver's userAverageRating
    await updateProviderAverageRating(senderId, rating); // Update sender's providerAverageRating

    // Send notification to both parties
    await sendRequestNotification(
      senderId,
      "Work Completed",
      `Work with ${receiver.name} has been marked as complete`
    );

    await sendRequestNotification(
      receiverId,
      "Work Completed",
      `Work with ${sender.name} has been marked as complete`
    );

    return res.status(200).send({
      success: true,
      message: "Work marked as done successfully",
    });
  } catch (error) {
    console.error("Error during workDone operation:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during the workDone operation.",
      error: error.message,
    });
  }
};

const workDoneMobile = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body; // receiverId and senderId provided in request body

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const [sender, receiver] = await Promise.all([
      User.findById(senderObjectId),
      User.findById(receiverObjectId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    const senderStatusUpdate = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      { $set: { "sended_requests.$.status": "done" } }
    );

    if (senderStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in sender's sended_requests to update status.",
      });
    }

    const receiverStatusUpdate = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      { $set: { "received_requests.$.status": "done" } }
    );

    if (receiverStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in receiver's received_requests to update status.",
      });
    }

    const receiverStatusUpdateResult = await User.updateOne(
      { _id: receiverObjectId },
      { $set: { userstatus: "available" } }
    );

    if (receiverStatusUpdateResult.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to update receiver's user status to 'available'.",
      });
    }

    // Send notification to both sender and receiver about the work being done
    const notificationToSender = {
      senderName: receiver.name,
      fcmToken: sender.fcmToken,
      title: "Work Done",
      message: `${receiver.name} has completed the work.`,
      receiverId: sender._id,
    };

    const notificationToReceiver = {
      senderName: sender.name,
      fcmToken: receiver.fcmToken,
      title: "Work Done",
      message: `${sender.name} has completed the work.`,
      receiverId: receiver._id,
    };

    // Sending notifications
    await sendNotification(notificationToSender);
    await sendNotification(notificationToReceiver);

    return res.status(200).send({
      success: true,
      message:
        "Request status updated, requests removed, and user status set to 'available'.",
    });
  } catch (error) {
    console.error("Error during work done operation:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during the work done operation.",
      error: error.message,
    });
  }
};

const getUserRequests = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming authenticated user ID is attached to req.user

    // Find user by ID and populate requests
    const user = await User.findById(userId)
      .populate({
        path: "sended_requests.user", // Populate user details in sent requests
        select: "name email", // Select specific fields to return
      })
      .populate({
        path: "received_requests.user", // Populate user details in received requests
        select: "name email", // Select specific fields to return
      });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).send({
      success: true,
      sendedRequests: user.sended_requests,
      receivedRequests: user.received_requests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while retrieving user requests.",
      error: error.message,
    });
  }
};

const getUserRequestsMobile = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming userId is provided in the request body

    // Find user by ID and populate requests
    const user = await User.findById(userId)
      .populate("sended_requests") // Populate details of sent requests
      .populate("received_requests"); // Populate details of received requests

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }
    console.log(user, "rr");
    return res.status(200).send({
      success: true,
      message: "get all request success",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while retrieving user requests.",
      error: error.message,
    });
  }
};

const getAllRequests = async (req, res) => {
  try {
    // Find all users and populate their requests
    const users = await User.find({})
      .populate("sended_requests.user", "name email") // Populate sent request user details
      .populate("received_requests.user", "name email"); // Populate received request user details

    // Create a summarized view of requests
    const allRequests = users.map((user) => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      sendedRequests: user.sended_requests,
      receivedRequests: user.received_requests,
    }));

    return res.status(200).send({
      success: true,
      data: allRequests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while retrieving all requests.",
      error: error.message,
    });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).send({
        success: false,
        message: "Request ID is required.",
      });
    }

    const senderUpdateResult = await User.updateOne(
      { "sended_requests._id": requestId },
      { $pull: { sended_requests: { _id: requestId } } }
    );

    const receiverUpdateResult = await User.updateOne(
      { "received_requests._id": requestId },
      { $pull: { received_requests: { _id: requestId } } }
    );

    if (
      senderUpdateResult.modifiedCount === 0 &&
      receiverUpdateResult.modifiedCount === 0
    ) {
      return res.status(404).send({
        success: false,
        message: "Request not found.",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Request deleted successfully.",
    });
  } catch (error) {
    console.error("Error during request deletion:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while deleting the request.",
      error: error.message,
    });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body;

    // Update request status
    const request = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    ).populate("userId");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Send notification if user has FCM token
    if (request.userId.fcmToken) {
      const title = "Request Update";
      const body =
        status === "approved"
          ? "Your request has been approved!"
          : "Your request has been cancelled.";

      await sendNotification(request.userId.fcmToken, title, body);
    }

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      request,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({
      success: false,
      message: "Error updating request",
    });
  }
};

module.exports = {
  sentRequest,
  sentRequestMobile,
  getUserRequests,
  getAllRequests,
  receivedRequest,
  cancelRequest,
  workDone,
  deleteRequest,
  getUserRequestsMobile,
  receivedRequestMobile,
  cancelRequestMobile,
  workDoneMobile,
  updateRequestStatus,
};
