const User = require("../model/user"); // Update the path as needed
const mongoose = require("mongoose");
// const { sendNotification } = require("../config/firebase");

// const sentRequest = async (req, res) => {
//   try {
//     const { receiverId } = req.body;
//     const senderId = req.user.id;

//     console.log("🔍 Fetching sender and receiver details...");

//     if (!senderId || !receiverId) {
//       return res.status(400).send({
//         success: false,
//         message: "Sender or receiver ID is missing.",
//       });
//     }

//     if (senderId === receiverId) {
//       return res.status(400).send({
//         success: false,
//         message: "You cannot send a request to yourself.",
//       });
//     }

//     const requestId = new mongoose.Types.ObjectId();

//     // Fetch only _id fields
//     const sender = await User.findById(senderId).select("_id name");
//     const receiver = await User.findById(receiverId).select("_id name");

//     // Debugging the fetched users
//     console.log("📌 Sender:", sender);
//     console.log("📌 Receiver:", receiver);
//     console.log("🔍 Fetching sender and receiver details...");

//     // Check if sender exists
//     if (!sender) {
//       console.error("❌ Sender not found!");
//       return res.status(404).send({
//         success: false,
//         message: "Sender not found.",
//       });
//     }

//     // Ensure sender.sended_requests is an array
//     if (!Array.isArray(sender.sended_requests)) {
//       console.warn(
//         "⚠️ 'sended_requests' not found. Initializing as an empty array."
//       );
//       sender.sended_requests = []; // Initialize it if missing
//     }

//     console.log("📌 Sender's sent requests:", sender.sended_requests);
//     console.log("📌 Receiver ID:", receiverId);

//     // Check if a pending request already exists
//     const existingSentRequest = sender.sended_requests.find((req) => {
//       console.log("📌 Checking request:", req);
//       console.log(
//         "📌 Condition being checked:",
//         req.user.toString(),
//         receiverId,
//         req.status === "pending"
//       );
//       return req.user.toString() === receiverId && req.status === "pending";
//     });

//     if (existingSentRequest) {
//       console.log("❌ Already sent request.");
//       return res.status(400).send({
//         success: false,
//         message: "Already sent request.",
//       });
//     }

//     // Proceed with request sending...
//     console.log("✅ No existing request found. Proceeding to send request...");

//     // Check if receiver exists
//     if (!receiver) {
//       console.error("❌ Receiver not found!");
//       return res.status(404).send({
//         success: false,
//         message: "Receiver not found.",
//       });
//     }

//     // Ensure receiver.received_requests is an array
//     if (!Array.isArray(receiver.received_requests)) {
//       console.warn(
//         "⚠️ 'received_requests' not found. Initializing as an empty array."
//       );
//       receiver.received_requests = [];
//     }

//     console.log("📌 Receiver's received requests:", receiver.received_requests);
//     console.log("📌 Sender ID:", senderId);

//     // Check if a pending request already exists from receiver to sender
//     const existingReceivedRequest = receiver.received_requests.find((req) => {
//       console.log("📌 Checking received request:", req);
//       console.log(
//         "📌 Condition being checked:",
//         req.user.toString(),
//         senderId,
//         req.status === "pending"
//       );
//       return req.user.toString() === senderId && req.status === "pending";
//     });

//     if (existingReceivedRequest) {
//       console.log("❌ Already received a request from this sender.");
//       return res.status(400).send({
//         success: false,
//         message: "Already sent request.",
//       });
//     }

//     // Proceed with request sending...
//     console.log("✅ No existing request found. Proceeding to send request...");

//     console.log("📌 Adding request to both users...");
//     // await Promise.all([
//     //   User.findByIdAndUpdate(senderId, {
//     //     $addToSet: { sended_requests: { user: receiver, status: "pending" } },
//     //   }),
//     //   User.findByIdAndUpdate(receiverId, {
//     //     $addToSet: { received_requests: { user: sender, status: "pending" } },
//     //   }),
//     // ]);

//     const senderUpdate = await User.updateOne(
//       { _id: senderId },
//       { $push: { sended_requests: { user: receiver._id, status: "pending" } } }
//     );

//     const receiverUpdate = await User.updateOne(
//       { _id: receiverId },
//       { $push: { received_requests: { user: sender._id, status: "pending" } } }
//     );

//     console.log("📌 Sending notification...");
//     console.log("📌 Sender Update:", senderUpdate);
//     console.log("📌 Receiver Update:", receiverUpdate);
//     const Notification = {
//       senderName: sender.name,
//       fcmToken: receiver.fcmToken,
//       title: "New Work",
//       message: `${sender.name} has sent you a request.`,
//       receiverId: receiver._id, // Include the receiver's ID to store the notification
//     };
//     console.log("🔵 Notification:", Notification);
//     // await sendNotification(Notification);

//     return res.status(200).send({
//       success: true,
//       message: "Request sent successfully.",
//       sender: { _id: sender._id, name: sender.name },
//       receiver: { _id: receiver._id, name: receiver.name },
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

const sendNotification = async ({ fcmToken, title, message }) => {
  if (!fcmToken) {
    console.error("FCM token is missing. Notification not sent.");
    return;
  }

  const payload = {
    token: fcmToken,
    notification: {
      title,
      body: message,
    },
    data: { click_action: "FLUTTER_NOTIFICATION_CLICK" }, // Optional custom data
  };

  try {
    await admin.messaging().send(payload);
    console.log("Notification sent successfully:", title);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const sentRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

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

    // ✅ Generate a common requestId for both sender & receiver

    // Fetch sender and receiver details
    const sender = await User.findById(senderId).select(
      "_id name sended_requests"
    );
    const receiver = await User.findById(receiverId).select(
      "_id name received_requests fcmToken"
    );

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    console.log("📌 Sender:", sender);
    console.log("📌 Receiver:", receiver);

    // Ensure sender & receiver requests arrays exist
    sender.sended_requests = sender.sended_requests || [];
    receiver.received_requests = receiver.received_requests || [];

    // ✅ Check if a pending request already exists (using requestId)
    const existingSentRequest = sender.sended_requests.find(
      (req) => req.user.toString() === receiverId && req.status === "pending"
    );

    if (existingSentRequest) {
      console.log("❌ Already sent request.");
      return res.status(400).send({
        success: false,
        message: "Already sent request.",
      });
    }

    console.log("✅ No existing request found. Proceeding to send request...");
    // ✅ Generate a common requestId
    const requestId = new mongoose.Types.ObjectId();
    console.log(requestId, "requestId");

    if (requestId) {
      sender.sended_requests.push({
        requestId: requestId, // Convert to string
        user: receiverId,
        status: "pending",
        date: new Date(),
      });

      receiver.received_requests.push({
        requestId: requestId,
        user: senderId,
        status: "pending",
        date: new Date(),
      });
    } else {
      console.error("❌ requestId is undefined!");
      return res.status(500).send({
        success: false,
        message: "Error generating request ID.",
      });
    }

    // ✅ Save both users
    await sender.save();
    await receiver.save();

    console.log("📌 Sending notification...");
    const Notification = {
      senderName: sender.name,
      fcmToken: receiver.fcmToken,
      title: "New Work",
      message: `${sender.name} has sent you a request.`,
      receiverId: receiver._id, // Include receiver's ID to store the notification
    };
    console.log("🔵 Notification:", Notification);
    // await sendNotification(Notification);

    return res.status(200).send({
      success: true,
      message: "Request sent successfully.",
      sender: { _id: sender._id, name: sender.name },
      receiver: { _id: receiver._id, name: receiver.name },
      requestId, // Return requestId for tracking
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

// Function to send FCM Notification
const sentRequestMobile = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body; // 🔹 Extract senderId directly from request

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

    // Fetch sender and receiver details
    const sender = await User.findById(senderId).select(
      "_id name sended_requests"
    );
    const receiver = await User.findById(receiverId).select(
      "_id name received_requests fcmToken"
    );

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    console.log("📌 Sender:", sender);
    console.log("📌 Receiver:", receiver);

    sender.sended_requests = sender.sended_requests || [];
    receiver.received_requests = receiver.received_requests || [];

    // ✅ Check if a pending request already exists
    const existingSentRequest = sender.sended_requests.find(
      (req) => req.user.toString() === receiverId && req.status === "pending"
    );

    if (existingSentRequest) {
      console.log("❌ Already sent request.");
      return res.status(400).send({
        success: false,
        message: "Already sent request.",
      });
    }

    console.log("✅ No existing request found. Proceeding to send request...");

    // ✅ Generate a common requestId
    const requestId = new mongoose.Types.ObjectId();
    console.log(requestId, "requestId");

    if (requestId) {
      sender.sended_requests.push({
        requestId: requestId, // Convert to string
        user: receiverId,
        status: "pending",
        date: new Date(),
      });

      receiver.received_requests.push({
        requestId: requestId,
        user: senderId,
        status: "pending",
        date: new Date(),
      });
    } else {
      console.log("❌ requestId is undefined!");
      return res.status(500).send({
        success: false,
        message: "Error generating request ID.",
      });
    }

    await sender.save();
    await receiver.save();

    console.log("📌 Sending notification...");
    const Notification = {
      senderName: sender.name,
      fcmToken: receiver.fcmToken,
      title: "New Work",
      message: `${sender.name} has sent you a request.`,
      receiverId: receiver._id,
    };
    console.log("🔵 Notification:", Notification);
    // await sendNotification(Notification);

    return res.status(200).send({
      success: true,
      message: "Request sent successfully.",
      sender: { _id: sender._id, name: sender.name },
      receiver: { _id: receiver._id, name: receiver.name },
      requestId,
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

// const sentRequestMobile = async (req, res) => {
//   try {
//     const { senderId, receiverId } = req.body;

//     console.log("🔍 Fetching sender and receiver details...");

//     if (!senderId || !receiverId) {
//       return res.status(400).send({
//         success: false,
//         message: "Sender or receiver ID is missing.",
//       });
//     }

//     if (senderId === receiverId) {
//       return res.status(400).send({
//         success: false,
//         message: "You cannot send a request to yourself.",
//       });
//     }

//     // Fetch only _id fields
//     const sender = await User.findById(senderId).select("_id name");
//     const receiver = await User.findById(receiverId).select("_id name");

//     // Debugging the fetched users
//     console.log("📌 Sender:", sender);
//     console.log("📌 Receiver:", receiver);
//     console.log("🔍 Fetching sender and receiver details...");

//     // Check if sender exists
//     if (!sender) {
//       console.error("❌ Sender not found!");
//       return res.status(404).send({
//         success: false,
//         message: "Sender not found.",
//       });
//     }

//     // Ensure sender.sended_requests is an array
//     if (!Array.isArray(sender.sended_requests)) {
//       console.warn(
//         "⚠️ 'sended_requests' not found. Initializing as an empty array."
//       );
//       sender.sended_requests = []; // Initialize it if missing
//     }

//     console.log("📌 Sender's sent requests:", sender.sended_requests);
//     console.log("📌 Receiver ID:", receiverId);

//     // Check if a pending request already exists
//     const existingSentRequest = sender.sended_requests.find((req) => {
//       console.log("📌 Checking request:", req);
//       console.log(
//         "📌 Condition being checked:",
//         req.user.toString(),
//         receiverId,
//         req.status === "pending"
//       );
//       return req.user.toString() === receiverId && req.status === "pending";
//     });

//     if (existingSentRequest) {
//       console.log("❌ Already sent request.");
//       return res.status(400).send({
//         success: false,
//         message: "Already sent request.",
//       });
//     }

//     // Proceed with request sending...
//     console.log("✅ No existing request found. Proceeding to send request...");

//     // Check if receiver exists
//     if (!receiver) {
//       console.error("❌ Receiver not found!");
//       return res.status(404).send({
//         success: false,
//         message: "Receiver not found.",
//       });
//     }

//     // Ensure receiver.received_requests is an array
//     if (!Array.isArray(receiver.received_requests)) {
//       console.warn(
//         "⚠️ 'received_requests' not found. Initializing as an empty array."
//       );
//       receiver.received_requests = [];
//     }

//     console.log("📌 Receiver's received requests:", receiver.received_requests);
//     console.log("📌 Sender ID:", senderId);

//     // Check if a pending request already exists from receiver to sender
//     const existingReceivedRequest = receiver.received_requests.find((req) => {
//       console.log("📌 Checking received request:", req);
//       console.log(
//         "📌 Condition being checked:",
//         req.user.toString(),
//         senderId,
//         req.status === "pending"
//       );
//       return req.user.toString() === senderId && req.status === "pending";
//     });

//     if (existingReceivedRequest) {
//       console.log("❌ Already received a request from this sender.");
//       return res.status(400).send({
//         success: false,
//         message: "Already sent request.",
//       });
//     }

//     // Proceed with request sending...
//     console.log("✅ No existing request found. Proceeding to send request...");

//     console.log("📌 Adding request to both users...");
//     await User.findByIdAndUpdate(senderId, {
//       $addToSet: { sended_requests: { user: receiver, status: "pending" } },
//     });

//     await User.findByIdAndUpdate(receiverId, {
//       $addToSet: { received_requests: { user: sender, status: "pending" } },
//     });

//     console.log("📌 Sending notification...");

//     const Notification = {
//       senderName: sender.name,
//       fcmToken: receiver.fcmToken,
//       title: "New Work",
//       message: `${sender.name} has sent you a request.`,
//       receiverId: receiver._id, // Include the receiver's ID to store the notification
//     };
//     console.log("🔵 Notification:", Notification);
//     // await sendNotification(Notification);

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
  console.log("[INFO] 📥 Fetching user requests...");

  try {
    const userId = req.user?.id; // Ensure req.user exists
    // const{ userId} = req.body; // Ensure req.user exists

    if (!userId) {
      console.warn("[WARN] ⚠️ Missing userId in request.");
      return res.status(400).json({
        success: false,
        message: "User authentication required.",
      });
    }

    console.log(`[INFO] 🔎 Fetching requests for userId: ${userId}`);

    // Fetch user with only necessary fields for sent & received requests
    const user = await User.findById(userId)
      .select("sended_requests received_requests")
      .populate({
        path: "sended_requests.user received_requests.user",
        select:
          "name phone email profilePic address businessCategory businessName businessAddress fcmToken userstatus averageRating ratings providerAverageRating providerRatings userAverageRating userRatings businessDetaile",
        options: { lean: true },
      })
      .lean();

    if (!user) {
      console.warn(`[WARN] ❌ User with ID ${userId} not found.`);
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Format sent requests
    const sendedRequests =
      user.sended_requests?.map((req) => ({
        _id: req.user?._id,
        name: req.user?.name,
        phone: req.user?.phone,
        email: req.user?.email,
        profilePic: req.user?.profilePic,
        address: req.user?.address,
        businessCategory: req.user?.businessCategory,
        businessName: req.user?.businessName,
        businessAddress: req.user?.businessAddress,
        fcmToken: req.user?.fcmToken,
        userstatus: req.user?.userstatus,
        averageRating: req.user?.averageRating,
        ratings: req.user?.ratings,
        providerAverageRating: req.user?.providerAverageRating,
        providerRatings: req.user?.providerRatings,
        userAverageRating: req.user?.userAverageRating,
        userRatings: req.user?.userRatings,
        businessDetaile: req.user?.businessDetaile,
        status: req.status,
        date: req.date,
        providerrating: req.providerrating,
      })) || [];

    // Format received requests
    const receivedRequests =
      user.received_requests?.map((req) => ({
        _id: req.user?._id,
        name: req.user?.name,
        phone: req.user?.phone,
        email: req.user?.email,
        profilePic: req.user?.profilePic,
        address: req.user?.address,
        businessCategory: req.user?.businessCategory,
        businessName: req.user?.businessName,
        businessAddress: req.user?.businessAddress,
        fcmToken: req.user?.fcmToken,
        userstatus: req.user?.userstatus,
        averageRating: req.user?.averageRating,
        ratings: req.user?.ratings,
        providerAverageRating: req.user?.providerAverageRating,
        providerRatings: req.user?.providerRatings,
        userAverageRating: req.user?.userAverageRating,
        userRatings: req.user?.userRatings,
        businessDetaile: req.user?.businessDetaile,
        status: req.status,
        date: req.date,
        providerrating: req.providerrating,
      })) || [];

    console.log(`[INFO] ✅ Requests retrieved successfully.`);
    return res.status(200).json({
      success: true,
      message: "Requests retrieved successfully",
      sendedRequests,
      receivedRequests,
    });
  } catch (error) {
    console.error("[ERROR] ❌ Failed to fetch requests:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving user requests.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
const getSentRequests = async (req, res) => {
  console.log("📤 [INFO] Fetching sent requests...");

  try {
    const userId = req.user?.id;
    if (!userId) {
      console.warn("⚠️ [WARN] Missing userId in request.");
      return res
        .status(400)
        .json({ success: false, message: "🔒 User authentication required." });
    }

    console.log(`🔎 [INFO] Fetching sent requests for userId: ${userId}`);

    const user = await User.findById(userId)
      .select("sended_requests")
      .populate({
        path: "sended_requests.user",
        select:
          "name phone email profilePic businessCategory businessName userAverageRating providerAverageRating",
        options: { lean: true },
      })
      .lean();

    if (!user) {
      console.warn(`❌ [WARN] User with ID ${userId} not found.`);
      return res
        .status(404)
        .json({ success: false, message: "🙅‍♂️ User not found." });
    }

    const sendedRequests =
      user.sended_requests?.map((req) => ({
        requestId: req.requestId, // ✅ Include requestId
        receiverId: req.user?._id,
        name: req.user?.name,
        phone: req.user?.phone,
        email: req.user?.email,
        profilePic: req.user?.profilePic,
        businessCategory: req.user?.businessCategory,
        businessName: req.user?.businessName,
        userAverageRating: req.user?.userAverageRating,
        providerAverageRating: req.user?.providerAverageRating,
        status: req.status,
        date: req.date,
      })) || [];

    // console.log(
    //   `✅ [SUCCESS] Retrieved ${sendedRequests.length} sent requests.`
    // );
    return res.status(200).json({
      success: true,
      message: "📩 Sent requests retrieved successfully!",
      sendedRequests,
    });
  } catch (error) {
    console.error("❌ [ERROR] Failed to fetch sent requests:", error);
    return res.status(500).json({
      success: false,
      message: "🚨 An error occurred while retrieving sent requests.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getReceivedRequests = async (req, res) => {
  console.log("📥 [INFO] Fetching received requests...");

  try {
    const userId = req.user?.id;
    if (!userId) {
      console.warn("⚠️ [WARN] Missing userId in request.");
      return res
        .status(400)
        .json({ success: false, message: "🔒 User authentication required." });
    }

    console.log(`🔎 [INFO] Fetching received requests for userId: ${userId}`);

    const user = await User.findById(userId)
      .select("received_requests")
      .populate({
        path: "received_requests.user",
        select:
          "name phone email profilePic businessCategory businessName providerAverageRating userAverageRating",
        options: { lean: true },
      })
      .lean();
    console.log(user, "user");
    if (!user) {
      console.warn(`❌ [WARN] User with ID ${userId} not found.`);
      return res
        .status(404)
        .json({ success: false, message: "🙅‍♂️ User not found." });
    }

    const receivedRequests =
      user.received_requests?.map((req) => ({
        requestId: req.requestId, // ✅ Include requestId
        senderId: req.user?._id,
        name: req.user?.name,
        phone: req.user?.phone,
        email: req.user?.email,
        profilePic: req.user?.profilePic,
        businessCategory: req.user?.businessCategory,
        businessName: req.user?.businessName,
        userAverageRating: req.user?.userAverageRating,
        providerAverageRating: req.user?.providerAverageRating,
        status: req.status,
        date: req.date,
      })) || [];

    // console.log(
    //   `✅ [SUCCESS] Retrieved ${receivedRequests.length} received requests.`
    // );
    return res.status(200).json({
      success: true,
      message: "📥 Received requests retrieved successfully!",
      receivedRequests,
    });
  } catch (error) {
    console.error("❌ [ERROR] Failed to fetch received requests:", error);
    return res.status(500).json({
      success: false,
      message: "🚨 An error occurred while retrieving received requests.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
    const userId = req.user.id;

    console.log(
      `📩 User(${userId}) updating request(${requestId}) to: ${status}`
    );

    if (!userId || !requestId || !status) {
      return res.status(400).json({
        success: false,
        message: "User ID, request ID, or status is missing!",
      });
    }

    const user = await User.findOne({
      $or: [
        { _id: userId, "sended_requests.requestId": requestId },
        { _id: userId, "received_requests.requestId": requestId },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "❌ Request not found!" });
    }

    if (!user || !user.sended_requests || !user.received_requests) {
      console.error("User or request lists are undefined");
      return res
        .status(400)
        .json({ success: false, message: "Invalid user data" });
    }

    const isSender = user.sended_requests.some(
      (r) => r.requestId && r.requestId.toString() === requestId
    );
    console.log(isSender, "is sender");

    const isReceiver = user.received_requests.some(
      (r) => r.requestId && r.requestId.toString() === requestId
    );

    console.log(isReceiver, "is receiver");

    if (!isSender && !isReceiver) {
      return res.status(404).json({
        success: false,
        message: "❌ Request not found in user data!",
      });
    }

    // 🚫 Prevent changing to the same status
    const requestField = isSender ? "sended_requests" : "received_requests";
    console.log(
      requestField,
      "request field============================================"
    );
    const request = user[requestField].find(
      (r) => r.requestId.toString() === requestId
    );

    if (request.status === status) {
      return res.status(400).json({
        success: false,
        message: `⚠️ Request is already '${status}'!`,
      });
    }

    console.log(
      request,
      "request--------------------------------------------------------"
    );

    let updateQueries = [];

    if (status === "cancelled") {
      updateQueries = [
        User.updateOne(
          { _id: userId, "received_requests.requestId": requestId },
          { $set: { "received_requests.$.status": status } }
        ),
        User.updateOne(
          { "sended_requests.requestId": requestId },
          { $set: { "sended_requests.$.status": status } }
        ),
      ];
    } else if (status === "rejected" || status === "accepted") {
      updateQueries = [
        // ✅ Update receiver's received_requests (user is rejecting the request)
        User.updateOne(
          { _id: userId, "received_requests.requestId": requestId },
          { $set: { "received_requests.$.status": status } }
        ),
        // ✅ Update sender's sended_requests (their request is being rejected)
        User.updateOne(
          { _id: request.user, "sended_requests.requestId": requestId },
          { $set: { "sended_requests.$.status": status } }
        ),
      ];
    } else if (status === "completed") {
      // ✅ Update only the user making the request when completed
      updateQueries = [
        User.updateOne(
          { _id: userId, [`${requestField}.requestId`]: requestId },
          { $set: { [`${requestField}.$.status`]: status } }
        ),
      ];
    }
    // Run updates in parallel and wait for both to complete
    const [userUpdate, otherUserUpdate] = await Promise.all(updateQueries);

    // If both updates failed, return error
    if (!userUpdate.modifiedCount && !otherUserUpdate.modifiedCount) {
      return res
        .status(400)
        .json({ success: false, message: "❌ Request update failed!" });
    }

    return res.status(200).json({
      success: true,
      message: `✅ Request '${status}' successfully! `,
    });
  } catch (error) {
    console.log(error, "error from update request status");
    return res.status(500).json({
      success: false,
      message: "🚨 Error updating request!",
      error: error.message,
    });
  }
};

const updateRequestStatusMobile = async (req, res) => {
  try {
    const { userId, requestId, status } = req.body; // 🔹 Extract userId from request body

    console.log(
      `📩 User(${userId}) updating request(${requestId}) to: ${status}`
    );

    if (!userId || !requestId || !status) {
      return res.status(400).json({
        success: false,
        message: "User ID, request ID, or status is missing!",
      });
    }

    const user = await User.findOne({
      $or: [
        { _id: userId, "sended_requests.requestId": requestId },
        { _id: userId, "received_requests.requestId": requestId },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "❌ Request not found!" });
    }

    if (!user.sended_requests || !user.received_requests) {
      console.error("User request lists are undefined");
      return res
        .status(400)
        .json({ success: false, message: "Invalid user data" });
    }

    const isSender = user.sended_requests.some(
      (r) => r.requestId && r.requestId.toString() === requestId
    );
    console.log(isSender, "is sender");

    const isReceiver = user.received_requests.some(
      (r) => r.requestId && r.requestId.toString() === requestId
    );
    console.log(isReceiver, "is receiver");

    if (!isSender && !isReceiver) {
      return res.status(404).json({
        success: false,
        message: "❌ Request not found in user data!",
      });
    }

    // 🚫 Prevent changing to the same status
    const requestField = isSender ? "sended_requests" : "received_requests";
    console.log(
      requestField,
      "request field===================================="
    );

    const request = user[requestField].find(
      (r) => r.requestId.toString() === requestId
    );

    if (request.status === status) {
      return res.status(400).json({
        success: false,
        message: `⚠️ Request is already '${status}'!`,
      });
    }

    console.log(
      request,
      "request--------------------------------------------------------"
    );

    let updateQueries = [];

    if (status === "cancelled") {
      updateQueries = [
        User.updateOne(
          { _id: userId, "received_requests.requestId": requestId },
          { $set: { "received_requests.$.status": status } }
        ),
        User.updateOne(
          { "sended_requests.requestId": requestId },
          { $set: { "sended_requests.$.status": status } }
        ),
      ];
    } else if (status === "rejected" || status === "accepted") {
      updateQueries = [
        // ✅ Update receiver's received_requests (user is rejecting the request)
        User.updateOne(
          { _id: userId, "received_requests.requestId": requestId },
          { $set: { "received_requests.$.status": status } }
        ),
        // ✅ Update sender's sended_requests (their request is being rejected)
        User.updateOne(
          { _id: request.user, "sended_requests.requestId": requestId },
          { $set: { "sended_requests.$.status": status } }
        ),
      ];
    } else if (status === "completed") {
      // ✅ Update only the user making the request when completed
      updateQueries = [
        User.updateOne(
          { _id: userId, [`${requestField}.requestId`]: requestId },
          { $set: { [`${requestField}.$.status`]: status } }
        ),
      ];
    }
    // Run updates in parallel and wait for both to complete
    const [userUpdate, otherUserUpdate] = await Promise.all(updateQueries);

    // If both updates failed, return error
    if (!userUpdate.modifiedCount && !otherUserUpdate.modifiedCount) {
      return res
        .status(400)
        .json({ success: false, message: "❌ Request update failed!" });
    }

    return res.status(200).json({
      success: true,
      message: `✅ Request '${status}' successfully updated!`,
    });
  } catch (error) {
    console.log(error, "error from update request status");
    return res.status(500).json({
      success: false,
      message: "🚨 Error updating request!",
      error: error.message,
    });
  }
};

const getSendedRequestsMobile = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(userId, "user id");

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Fetch only sended_requests and populate user details
    const user = await User.findById(userId)
      .select("sended_requests")
      .populate({
        path: "sended_requests.user",
        select:
          "name phone email profilePic address businessCategory businessName businessAddress fcmToken userstatus averageRating ratings providerAverageRating providerRatings userAverageRating userRatings businessDetaile",
        options: { lean: true },
      })
      .lean();

    console.log(user, "user from get sended request");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Format response without 'user' wrapper
    const sendedRequests = user.sended_requests.map((req) => ({
      _id: req.user?._id,
      requestId: req.requestId,
      name: req.user?.name,
      phone: req.user?.phone,
      email: req.user?.email,
      profilePic: req.user?.profilePic,
      address: req.user?.address,
      businessCategory: req.user?.businessCategory,
      businessName: req.user?.businessName,
      businessAddress: req.user?.businessAddress,
      fcmToken: req.user?.fcmToken,
      userstatus: req.user?.userstatus,
      averageRating: req.user?.averageRating,
      ratings: req.user?.ratings,
      providerAverageRating: req.user?.providerAverageRating,
      providerRatings: req.user?.providerRatings,
      userAverageRating: req.user?.userAverageRating,
      userRatings: req.user?.userRatings,
      businessDetaile: req.user?.businessDetaile,
      // status: req.user?.sendedRequests.status,
      status: req.status,
      date: req.date,
      providerrating: req.providerrating,
    }));

    // console.log(
    //   // sendedRequests,
    //   "===========================sended reque===============sts==================================="
    // );

    return res.status(200).json({
      success: true,
      message: "Requests retrieved successfully",
      data: sendedRequests,
    });
  } catch (error) {
    console.error("Request retrieval error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing requests",
      error: error.message,
    });
  }
};

const getReceivedRequestsMobile = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(userId, "user id");
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Fetch only received_requests and populate user details
    const user = await User.findById(userId)
      .select("received_requests")
      .populate({
        path: "received_requests.user",
        select:
          "name phone email profilePic address businessCategory businessName businessAddress fcmToken userstatus averageRating ratings providerAverageRating providerRatings userAverageRating userRatings businessDetaile",
        options: { lean: true },
      })
      .lean();
    console.log(user, "user from get received request");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Format response without 'user' wrapper
    const receivedRequests = user.received_requests.map((req) => ({
      _id: req.user?._id,
      requestId: req.requestId,
      name: req.user?.name,
      phone: req.user?.phone,
      email: req.user?.email,
      profilePic: req.user?.profilePic,
      address: req.user?.address,
      businessCategory: req.user?.businessCategory,
      businessName: req.user?.businessName,
      businessAddress: req.user?.businessAddress,
      fcmToken: req.user?.fcmToken,
      userstatus: req.user?.userstatus,
      averageRating: req.user?.averageRating,
      ratings: req.user?.ratings,
      providerAverageRating: req.user?.providerAverageRating,
      providerRatings: req.user?.providerRatings,
      userAverageRating: req.user?.userAverageRating,
      userRatings: req.user?.userRatings,
      businessDetaile: req.user?.businessDetaile,
      status: req.status,
      date: req.date,
      providerrating: req.providerrating,
    }));
    // console.log(receivedRequests, "received requests mobile");

    return res.status(200).json({
      success: true,
      message: "Requests retrieved successfully",
      data: receivedRequests,
    });
  } catch (error) {
    console.error("Request retrieval error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing requests",
      error: error.message,
    });
  }
};

const getUsersWithRequestsCounts = async (req, res) => {
  try {
    const updateResult = await User.updateMany(
      {},
      {
        $set: {
          walletBalance: 0,
          earnings: 0,
          referrals: [],
        },
      }
    );

    console.log(
      `[SUCCESS] ✅ Reset completed for ${updateResult.modifiedCount} users.`
    );
    return res.status(200).send({
      success: true,
      message: "All users' requests set to null successfully.",
    });
  } catch (error) {
    console.error("🔥 Error updating referral codes:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
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
  receivedRequestMobile,
  cancelRequestMobile,
  workDoneMobile,
  updateRequestStatus,
  getSendedRequestsMobile,
  getReceivedRequestsMobile,
  getSentRequests,
  getReceivedRequests,
  getUsersWithRequestsCounts,
  updateRequestStatusMobile,
};
