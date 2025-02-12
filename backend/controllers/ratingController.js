const UserModel = require("../model/user");
const { sendNotification } = require("./sendController");
const mongoose = require("mongoose");

const updateAverage = (ratingsArray) => {
  if (!ratingsArray || ratingsArray.length === 0) return 0;
  return (
    ratingsArray.reduce((sum, r) => sum + r.rating, 0) / ratingsArray.length
  ).toFixed(1);
};

// const addRating = async (req, res) => {
//   try {
//     const { requestId, receiverId, ratingValue, comment } = req.body;
//     const senderId = req.user.id;

//     if (!requestId || !senderId || !receiverId || !ratingValue) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     if (ratingValue < 1 || ratingValue > 10) {
//       return res
//         .status(400)
//         .json({ message: "Rating must be between 1 and 10" });
//     }

//     const sender = await UserModel.findById(senderId);
//     const receiver = await UserModel.findById(receiverId);

//     if (!sender || !receiver) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const sentRequest = sender.sended_requests.find(
//       (req) =>
//         req.requestId.toString() === requestId && req.status === "completed"
//     );
//     const receivedRequest = sender.received_requests.find(
//       (req) =>
//         req.requestId.toString() === requestId && req.status === "completed"
//     );

//     if (!sentRequest && !receivedRequest) {
//       return res
//         .status(400)
//         .json({ message: "No completed request found for rating" });
//     }

//     const isSenderRatingReceiver = !!sentRequest;
//     const isReceiverRatingSender = !!receivedRequest;

//     if (isSenderRatingReceiver) {
//       // Sender rates the receiver (provider rating)
//       await UserModel.updateOne(
//         { _id: receiverId },
//         {
//           $push: {
//             providerRatings: {
//               rater: senderId,
//               rating: ratingValue,
//               comment,
//               date: new Date(),
//             },
//           },
//         }
//       );

//       const updatedReceiver = await UserModel.findById(receiverId);
//       const providerAverageRating = updateAverage(
//         updatedReceiver.providerRatings ?? []
//       );

//       await UserModel.updateOne(
//         { _id: receiverId },
//         { $set: { providerAverageRating } }
//       );

//       await UserModel.updateOne(
//         { _id: senderId, "sended_requests.requestId": requestId },
//         {
//           $set: {
//             "sended_requests.$.providerrating": {
//               value: ratingValue,
//               comment,
//               date: new Date(),
//             },
//             "sended_requests.$.status": "rated",
//           },
//         }
//       );
//     } else if (isReceiverRatingSender) {
//       // Receiver rates the sender (user rating)
//       await UserModel.updateOne(
//         { _id: senderId },
//         {
//           $push: {
//             userRatings: {
//               rater: receiverId,
//               rating: ratingValue,
//               comment,
//               date: new Date(),
//             },
//           },
//         }
//       );

//       const updatedSender = await UserModel.findById(senderId);
//       const userAverageRating = updateAverage(updatedSender.userRatings ?? []);

//       await UserModel.updateOne(
//         { _id: senderId },
//         { $set: { userAverageRating } }
//       );

//       await UserModel.updateOne(
//         { _id: receiverId, "received_requests.requestId": requestId },
//         {
//           $set: {
//             "received_requests.$.userrating": {
//               value: ratingValue,
//               comment,
//               date: new Date(),
//             },
//             "received_requests.$.status": "rated",
//           },
//         }
//       );
//     }

//     return res.json({
//       success: true,
//       message: "Rating submitted successfully! 🚀",
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };
const addRating = async (req, res) => {
  try {
    const { requestId, receiverId, ratingValue, comment } = req.body;
    const senderId = req.user.id;

    console.log("🔍 Incoming Rating Request:", {
      requestId,
      receiverId,
      ratingValue,
      comment,
      senderId,
    });

    if (!requestId || !senderId || !receiverId || !ratingValue) {
      console.error("❌ Missing required fields:", {
        requestId,
        senderId,
        receiverId,
        ratingValue,
      });
      return res.status(400).json({ message: "❌ Missing required fields" });
    }

    if (ratingValue < 1 || ratingValue > 10) {
      console.error("⚠️ Invalid rating value:", ratingValue);
      return res
        .status(400)
        .json({ message: "⚠️ Rating must be between 1 and 10" });
    }

    const sender = await UserModel.findById(senderId);
    const receiver = await UserModel.findById(receiverId);

    if (!sender || !receiver) {
      console.error("❌ User not found:", {
        senderFound: !!sender,
        receiverFound: !!receiver,
      });
      return res.status(404).json({ message: "❌ User not found" });
    }

    const objectIdRequestId = new mongoose.Types.ObjectId(requestId);

    console.log("✅ Users found:", { senderId, receiverId });

    const sentRequest = sender.sended_requests?.find(
      (req) =>
        req.requestId?.toString() === objectIdRequestId.toString() &&
        req.status === "completed"
    );
    const receivedRequest = sender.received_requests?.find(
      (req) =>
        req.requestId?.toString() === objectIdRequestId.toString() &&
        req.status === "completed"
    );

    console.log("📌 Request check:", {
      sentRequest: !!sentRequest,
      receivedRequest: !!receivedRequest,
    });

    if (!sentRequest && !receivedRequest) {
      console.error("⚠️ No completed request found for rating");
      return res
        .status(400)
        .json({ message: "⚠️ No completed request found for rating" });
    }

    // ✅ Sender is rating the receiver (provider rating)
    if (sentRequest) {
      console.log("📝 Sender is rating the receiver");

      const updateProviderRating = await UserModel.updateOne(
        { _id: receiverId },
        {
          $push: {
            providerRatings: {
              rater: senderId,
              rating: ratingValue,
              comment,
              date: new Date(),
            },
          },
        }
      );

      console.log("✅ Provider rating updated:", updateProviderRating);

      const updatedReceiver = await UserModel.findById(receiverId);
      const providerAverageRating = updateAverage(
        updatedReceiver.providerRatings ?? []
      );

      const updateReceiver = await UserModel.updateOne(
        { _id: receiverId },
        { $set: { providerAverageRating } }
      );

      console.log("✅ Provider average rating updated:", updateReceiver);

      const updateSenderRequest = await UserModel.updateOne(
        { _id: senderId, "sended_requests.requestId": requestId },
        {
          $set: {
            "sended_requests.$.providerrating": {
              value: ratingValue,
              comment,
              date: new Date(),
            },
            "sended_requests.$.status": "rated",
          },
        }
      );

      console.log("✅ Sender's request updated:", updateSenderRequest);
    }

    // ✅ Receiver is rating the sender (user rating)
    if (receivedRequest) {
      console.log("📝 Receiver is rating the sender");

      const updateUserRating = await UserModel.updateOne(
        { _id: receiverId },
        {
          $push: {
            userRatings: {
              rater: senderId,
              rating: ratingValue,
              comment,
              date: new Date(),
            },
          },
        }
      );

      console.log("✅ User rating updated:", updateUserRating);

      const updatedSender = await UserModel.findById(senderId);
      const userAverageRating = updateAverage(updatedSender.userRatings ?? []);

      const updateSender = await UserModel.updateOne(
        { _id: receiverId },
        { $set: { userAverageRating } }
      );

      console.log("✅ User average rating updated:", updateSender);

      const updateReceiverRequest = await UserModel.updateOne(
        { _id: senderId, "received_requests.requestId": requestId },
        {
          $set: {
            "received_requests.$.userrating": {
              value: ratingValue,
              comment,
              date: new Date(),
            },
            "received_requests.$.status": "rated",
          },
        }
      );

      console.log("✅ Receiver's request updated:", updateReceiverRequest);
    }

    return res.json({
      success: true,
      message: "⭐ Rating submitted successfully!",
    });
  } catch (error) {
    console.error("❌ Error adding rating:", error);
    return res.status(500).json({ message: "🚨 Server error" });
  }
};

const addRatingMobile = async (req, res) => {
  try {
    const { senderId, requestId, receiverId, ratingValue, comment } = req.body;

    console.log("🔍 Incoming Rating Request:", {
      requestId,
      receiverId,
      ratingValue,
      comment,
      senderId,
    });

    if (!requestId || !senderId || !receiverId || !ratingValue) {
      console.error("❌ Missing required fields:", {
        requestId,
        senderId,
        receiverId,
        ratingValue,
      });
      return res.status(400).json({ message: "❌ Missing required fields" });
    }

    if (ratingValue < 1 || ratingValue > 10) {
      console.error("⚠️ Invalid rating value:", ratingValue);
      return res
        .status(400)
        .json({ message: "⚠️ Rating must be between 1 and 10" });
    }

    const sender = await UserModel.findById(senderId);
    const receiver = await UserModel.findById(receiverId);

    if (!sender || !receiver) {
      console.error("❌ User not found:", {
        senderFound: !!sender,
        receiverFound: !!receiver,
      });
      return res.status(404).json({ message: "❌ User not found" });
    }

    const objectIdRequestId = new mongoose.Types.ObjectId(requestId);

    console.log("✅ Users found:", { senderId, receiverId });

    const sentRequest = sender.sended_requests?.find(
      (req) =>
        req.requestId?.toString() === objectIdRequestId.toString() &&
        req.status === "completed"
    );
    const receivedRequest = sender.received_requests?.find(
      (req) =>
        req.requestId?.toString() === objectIdRequestId.toString() &&
        req.status === "completed"
    );

    console.log("📌 Request check:", {
      sentRequest: !!sentRequest,
      receivedRequest: !!receivedRequest,
    });

    if (!sentRequest && !receivedRequest) {
      console.error("⚠️ No completed request found for rating");
      return res
        .status(400)
        .json({ message: "⚠️ No completed request found for rating" });
    }

    // ✅ Sender is rating the receiver (provider rating)
    if (sentRequest) {
      console.log("📝 Sender is rating the receiver");

      const updateProviderRating = await UserModel.updateOne(
        { _id: receiverId },
        {
          $push: {
            providerRatings: {
              rater: senderId,
              rating: ratingValue,
              comment,
              date: new Date(),
            },
          },
        }
      );

      console.log("✅ Provider rating updated:", updateProviderRating);

      const updatedReceiver = await UserModel.findById(receiverId);
      const providerAverageRating = updateAverage(
        updatedReceiver.providerRatings ?? []
      );

      const updateReceiver = await UserModel.updateOne(
        { _id: receiverId },
        { $set: { providerAverageRating } }
      );

      console.log("✅ Provider average rating updated:", updateReceiver);

      const updateSenderRequest = await UserModel.updateOne(
        { _id: senderId, "sended_requests.requestId": requestId },
        {
          $set: {
            "sended_requests.$.providerrating": {
              value: ratingValue,
              comment,
              date: new Date(),
            },
            "sended_requests.$.status": "rated",
          },
        }
      );

      console.log("✅ Sender's request updated:", updateSenderRequest);
    }

    // ✅ Receiver is rating the sender (user rating)
    if (receivedRequest) {
      console.log("📝 Receiver is rating the sender");

      const updateUserRating = await UserModel.updateOne(
        { _id: receiverId },
        {
          $push: {
            userRatings: {
              rater: senderId,
              rating: ratingValue,
              comment,
              date: new Date(),
            },
          },
        }
      );

      console.log("✅ User rating updated:", updateUserRating);

      const updatedSender = await UserModel.findById(senderId);
      const userAverageRating = updateAverage(updatedSender.userRatings ?? []);

      const updateSender = await UserModel.updateOne(
        { _id: receiverId },
        { $set: { userAverageRating } }
      );

      console.log("✅ User average rating updated:", updateSender);

      const updateReceiverRequest = await UserModel.updateOne(
        { _id: senderId, "received_requests.requestId": requestId },
        {
          $set: {
            "received_requests.$.userrating": {
              value: ratingValue,
              comment,
              date: new Date(),
            },
            "received_requests.$.status": "rated",
          },
        }
      );

      console.log("✅ Receiver's request updated:", updateReceiverRequest);
    }

    return res.json({
      success: true,
      message: "⭐ Rating submitted successfully!",
    });
  } catch (error) {
    console.error("❌ Error adding rating:", error);
    return res.status(500).json({ message: "🚨 Server error" });
  }
};

const getUserRating = async (req, res) => {
  try {
    const userId = req.user.id; // Assume authentication middleware sets `req.user`

    // Validate input
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Find the user and select relevant fields
    const user = await UserModel.findById(userId).select(
      "name email ratings averageRating providerAverageRating providerRatings userRatings userAverageRating"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Calculate average ratings for both roles (if applicable)
    const providerAvgRating = user.providerAverageRating || 0; // As a provider
    const userAvgRating = user.userAverageRating || 0; // As a regular user

    res.status(200).json({
      message: "User ratings retrieved successfully.",
      userDetails: {
        name: user.name,
        email: user.email,
      },
      ratings: {
        providerRatings: user.providerRatings || [], // List of ratings as a provider
        userRatings: user.userRatings || [], // List of ratings as a user
      },
      averages: {
        providerAverageRating: providerAvgRating,
        userAverageRating: userAvgRating,
      },
    });
  } catch (error) {
    console.error("Error retrieving user ratings:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getProviderRating = async (req, res) => {
  const { userId } = req.params;
  // console.log(userId,"id");
  try {
    // Fetch ratings for the user
    const userRatings = await UserModel.findById(userId);
    // console.log(userRatings,"UserRating");

    if (!userRatings || userRatings.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No ratings found for this user." });
    }

    res.status(200).json({
      success: true,
      message: "Ratings fetched successfully.",
      ratings: userRatings, // Assuming each rating document contains a `rating` field
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching ratings.",
      error: error.message,
    });
  }
};
const rateUser = async (req, res) => {
  try {
    const { raterId, rating, comment } = req.body;
    const userId = req.user.id;
    if (rating < 1 || rating > 10) {
      return res
        .status(400)
        .send({ success: false, message: "Rating must be between 1 and 10." });
    }

    // Find the user being rated
    const user = await UserModel.findById(raterId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found." });
    }

    // Prevent self-rating
    if (userId === raterId) {
      return res
        .status(400)
        .send({ success: false, message: "Users cannot rate themselves." });
    }

    // Check if the rater has already rated this user
    const existingRating = user.userRatings.find(
      (r) => r.rater.toString() === raterId
    );

    if (existingRating) {
      // Update the existing rating
      existingRating.rating = rating;
      existingRating.comment = comment || existingRating.comment;
    } else {
      // Add a new rating
      user.userRatings.push({
        rater: raterId,
        rating,
        comment,
      });
    }

    // Recalculate the average rating
    const totalRatings = user.userRatings.reduce((sum, r) => sum + r.rating, 0);
    user.userAverageRating = totalRatings / user.userRatings.length;

    await user.save();

    return res.status(200).send({
      success: true,
      message: "User rated successfully.",
      userAverageRating: user.userAverageRating,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error while rating user.",
      error: error.message,
    });
  }
};

// const rateProvider = async (req, res) => {
//   try {
//     const { raterId, rating, comment } = req.body;
//     const providerId = req.user.id;
//     if (rating < 1 || rating > 10) {
//       return res.status(400).send({ success: false, message: "Rating must be between 1 and 10." });
//     }

//     // Find the provider being rated
//     const provider = await UserModel.findById(raterId);
//     if (!provider) {
//       return res.status(404).send({ success: false, message: "Provider not found." });
//     }

//     // Prevent self-rating
//     if (providerId === raterId) {
//       return res.status(400).send({ success: false, message: "Providers cannot rate themselves." });
//     }

//     // Check if the rater has already rated this provider
//     const existingRating = provider.providerRatings.find((r) => r.rater.toString() === raterId);

//     if (existingRating) {
//       // Update the existing rating
//       existingRating.rating = rating;
//       existingRating.comment = comment || existingRating.comment;
//     } else {
//       // Add a new rating
//       provider.providerRatings.push({
//         rater: raterId,
//         rating,
//         comment,
//       });
//     }

//     // Recalculate the average rating
//     const totalRatings = provider.providerRatings.reduce((sum, r) => sum + r.rating, 0);
//     provider.providerAverageRating = totalRatings / provider.providerRatings.length;

//     await provider.save();

//     return res.status(200).send({
//       success: true,
//       message: "Provider rated successfully.",
//       providerAverageRating: provider.providerAverageRating,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({
//       success: false,
//       message: "Error while rating provider.",
//       error: error.message,
//     });
//   }
// };

// const rateProvider = async (req, res) => {
//   try {
//     const { receiverId, rating, comment } = req.body;
//     const senderId = req.user.id;

//     if (!rating || rating < 1 || rating > 10) {
//       return res.status(400).send({
//         success: false,
//         message: "Rating is required and must be between 1 and 10.",
//       });
//     }

//     const senderObjectId = new mongoose.Types.ObjectId(senderId);
//     const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

//     const [sender, receiver] = await Promise.all([
//       UserModel.findById(senderObjectId),
//       UserModel.findById(receiverObjectId),
//     ]);

//     if (!sender || !receiver) {
//       return res.status(404).send({
//         success: false,
//         message: "Sender or receiver not found.",
//       });
//     }

//     // Update the sender's sended_requests
//     const senderStatusUpdate = await UserModel.updateOne(
//       { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
//       { $set: { "sended_requests.$.status": "completed" } }
//     );

//     if (senderStatusUpdate.matchedCount === 0) {
//       return res.status(400).send({
//         success: false,
//         message:
//           "No matching request found in sender's sended_requests to update status.",
//       });
//     }

//     // Update the receiver's received_requests
//     const receiverStatusUpdate = await UserModel.updateOne(
//       { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
//       { $set: { "received_requests.$.status": "done" } }
//     );

//     if (receiverStatusUpdate.matchedCount === 0) {
//       return res.status(400).send({
//         success: false,
//         message:
//           "No matching request found in receiver's received_requests to update status.",
//       });
//     }

//     // Update the receiver's userstatus to 'available'
//     const receiverStatusUpdateResult = await UserModel.updateOne(
//       { _id: receiverObjectId },
//       { $set: { userstatus: "available" } }
//     );

//     if (receiverStatusUpdateResult.modifiedCount === 0) {
//       return res.status(400).send({
//         success: false,
//         message: "Failed to update receiver's user status to 'available'.",
//       });
//     }

//     // Add the rating to the receiver's providerRatings
//     receiver.providerRatings.push({
//       rater: sender._id,
//       rating,
//       comment,
//     });

//     // Recalculate the provider's average rating
//     const totalRatings = receiver.providerRatings.reduce(
//       (sum, review) => sum + review.rating,
//       0
//     );
//     receiver.providerAverageRating =
//       totalRatings / receiver.providerRatings.length;

//     await receiver.save();

//     // Send notifications
//     await sendNotification({
//       senderName: receiver.name,
//       fcmToken: sender.fcmToken,
//       title: "Work Done",
//       message: `${receiver.name} has completed the work.`,
//     });

//     const Notification = {
//       senderName: sender.name,
//       fcmToken: receiver.fcmToken,
//       title: "Work Done",
//       message: `${sender.name} has completed the work.`,
//       receiverId: sender._id,
//     };

//     await sendNotification(Notification);

//     return res.status(200).send({
//       success: true,
//       message:
//         "Request status updated, requests removed, user status set to 'available', and rating added.",
//       averageRating: receiver.providerAverageRating,
//     });
//   } catch (error) {
//     console.error("Error during work done operation:", error);
//     return res.status(500).send({
//       success: false,
//       message: "An error occurred during the work done operation.",
//       error: error.message,
//     });
//   }
// };

const rateProvider = async (req, res) => {
  try {
    const { providerId, ratingValue, comment } = req.body;
    const senderId = req.user.id;

    // Validate inputs
    if (!providerId || !ratingValue || ratingValue < 1 || ratingValue > 10) {
      return res.status(400).send({
        success: false,
        message:
          "Provider ID, valid rating value (1-10), and comment are required.",
      });
    }

    // Fetch the sender and provider
    const [sender, provider] = await Promise.all([
      UserModel.findById(senderId),
      UserModel.findById(providerId),
    ]);

    if (!sender || !provider) {
      return res.status(404).send({
        success: false,
        message: "Sender or provider not found.",
      });
    }

    // Validate if the request status is "done"
    const senderRequestIndex = sender.sended_requests.findIndex(
      (req) => req.user._id.toString() === providerId && req.status === "done"
    );

    const providerRequestIndex = provider.received_requests.findIndex(
      (req) => req.user._id.toString() === senderId && req.status === "done"
    );

    if (senderRequestIndex === -1 || providerRequestIndex === -1) {
      return res.status(400).send({
        success: false,
        message: "No completed request found to rate.",
      });
    }

    // Update the rating in sender's sended_requests
    sender.sended_requests[senderRequestIndex].providerrating = {
      value: ratingValue,
      comment,
      date: new Date(),
    };

    // Add rating to provider's providerRatings
    provider.userRatings.push({
      rater: sender._id,
      rating: ratingValue,
      comment,
      date: new Date(),
    });

    // Recalculate provider's userAverageRating
    const totalUserRatings = provider.userRatings.length; // Note: Fixed reference to `providerRatings`
    const sumUserRatings = provider.userRatings.reduce(
      (acc, r) => acc + r.rating,
      0
    );
    provider.userAverageRating =
      totalUserRatings > 0 ? sumUserRatings / totalUserRatings : 0; // Avoid NaN

    // Save changes to both users
    await Promise.all([sender.save(), provider.save()]);

    return res.status(200).send({
      success: true,
      message: "Rating submitted successfully, and all records updated.",
    });
  } catch (error) {
    console.error("Error rating provider:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while rating the provider.",
      error: error.message,
    });
  }
};

const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId)
      .populate({
        path: "userRatings.rater",
        select: "name email",
      })
      .populate({
        path: "providerRatings.rater",
        select: "name email",
      });

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found." });
    }

    return res.status(200).send({
      success: true,
      userAverageRating: user.userAverageRating,
      providerAverageRating: user.providerAverageRating,
      userRatings: user.userRatings,
      providerRatings: user.providerRatings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error fetching ratings.",
      error: error.message,
    });
  }
};

module.exports = {
  addRating,
  getUserRating,
  addRatingMobile,
  getProviderRating,
  rateUser,
  rateProvider,
  getUserRatings,
};
