const UserModel = require("../model/user");

const {
  distributeReferralRewards,
} = require("../controllers/paymentController");

const getUsersByBCategory = async (req, res) => {
  try {
    const { category, city } = req.body;
    console.log("📝 Category:", category, "🏙️ City:", city);

    // Validate input
    if (!category || !city) {
      console.log("❌ Missing category or city");
      return res.status(400).json({
        success: false,
        message: "Category and City are required.",
      });
    }
    console.log("✅ Input validated: category and city are present");

    // Query users based on category and city
    console.log("🔍 Querying users in category:", category, "and city:", city);
    const users = await UserModel.find({
      businessCategory: category,
      "address.city": city,
      paymentVerified: true,
      isAdminApproved: true,
    }).select(
      "_id name email phone businessCategory profilePic address businessName userstatus userAverageRating userRatings providerRatings providerAverageRating received_requests sended_requests"
    );

    console.log("Users count:", users.length);

    if (users.length === 0) {
      console.log(
        "⚠️ No service providers found in this category for your city"
      );
      return res.status(200).json({
        success: true,
        message: "No service providers found in this category for your city",
        users: [],
      });
    }
    console.log(users, "bc users");
    // Send response with fetched users
    res.status(200).json({
      success: true,
      message: `Found ${users.length} service provider(s) 🎉`,
      users,
    });
  } catch (error) {
    console.error("💥 Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service providers. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateUserAddressAndAadhar = async (req, res) => {
  try {
    const { userId, permanentAddress, aadharNumber } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    console.log("User ID:", userId);
    console.log("Permanent Address:", permanentAddress);
    console.log("Aadhar Number:", aadharNumber);

    // Validate Aadhar number format if provided
    if (aadharNumber) {
      const aadharRegex = /^\d{12}$/;
      if (!aadharRegex.test(aadharNumber)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Aadhar number format. Must be 12 digits.",
        });
      }

      // Check if Aadhar number already exists for another user
      const existingUser = await UserModel.findOne({
        aadharNumber,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Aadhar number already registered with another user.",
        });
      }
    }

    // Prepare update object
    const updateFields = {};
    if (permanentAddress) updateFields.permanentAddress = permanentAddress;
    if (aadharNumber) updateFields.aadharNumber = aadharNumber;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update.",
      });
    }

    // Update user document
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    ).select("permanentAddress aadharNumber"); // Return only required fields

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUserAddressAndAadhar:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating user details.",
      error: error.message,
    });
  }
};

const setReferral = async (req, res) => {
  try {
    const { referrerPhone, referredPhone } = req.body;

    // Validate input
    if (!referrerPhone || !referredPhone) {
      return res.status(400).json({
        message: "Both referrer and referred phone numbers are required.",
      });
    }

    // Find both users in parallel using indexed phone numbers
    const [referrer, referred] = await Promise.all([
      UserModel.findOne({ phone: referrerPhone })
        .select("_id name paymentVerified")
        .lean(),
      UserModel.findOne({ phone: referredPhone })
        .select("_id name referredBy paymentVerified")
        .lean(),
    ]);
    console.log(referred, "qwertyuio");
    // Check user existence
    if (!referrer || !referred) {
      return res.status(404).json({ message: "One or both users not found." });
    }

    // Check if referred already has a referrer
    if (referred.referredBy?.length > 0) {
      return res
        .status(400)
        .json({ message: "Referred user already has a referrer." });
    }

    // Atomic update to set referrer only if not already set
    const referredUpdate = await UserModel.updateOne(
      { _id: referred._id, referredBy: { $size: 0 } },
      { $set: { referredBy: [referrer._id] } }
    );

    if (referredUpdate.modifiedCount === 0) {
      return res
        .status(400)
        .json({ message: "Referred user already has a referrer." });
    }

    // Update referrer's referrals atomically
    await UserModel.updateOne(
      { _id: referrer._id },
      { $push: { referrals: referred._id } }
    );

    if (referred.paymentVerified == true) {
      await distributeReferralRewards(referred._id, referrer._id);
    }
    console.log(referred.paymentVerified, "klklklklklkl");
    return res.status(200).json({
      message: "Referral relationship established successfully.",
      referrer: referrer.name,
      referred: referred.name,
    });

    return res.status(200).json({
      message: "Referral relationship established successfully.",
      referrer: referrer.name,
      referred: referred.name,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

const getUserAadhaarDetails = async (req, res) => {
  try {
    // List of user IDs
    const userIds = [
      "678b540577b05d9ae4d686d0",
      "678b56056939b01acd70d9dd",
      "678b5e4038264e14724d5da9",
      "678b60cd50c6a3b37c9cda32",
      "678b619350c6a3b37c9cda9e",
      "678b6a868ab121215655d7de",
      "678b6dc8287200ee689611f1",
      "678d6ce8f1277af44ff3f136",
      "678d8059ac1ce7729741da66",
      "678ded4cdac94eaf3e0f98c8",
      "678df13db7a93b00570c002a",
      "678dfc5d70c781f9a6c681d2",
      "678e2a86605b0af45dbad68a",
      "678e45d06973260305c4126c",
      "6790bb735eb719a777fe550c",
      "6790bbd25eb719a777fe55d3",
      "6791ddea5eb719a777fe948b",
      "679883e23550a99555364e6e",
      "6799b12ef577113f0f8e1d2d",
      "6799cf2157029b6c015a400a",
      "679a0700dde2c802e7f7f0cb",
      "679a175f2a783b9adf84494b",
      "679a213b2a783b9adf84784d",
      "679a290d8141997906755198",
      "679b61f39d362867d58ce360",
    ];

    // Find users based on the list of IDs
    const users = await UserModel.find({ _id: { $in: userIds } }).select(
      "name frontAadhar backAadhar"
    );

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }

    // Send the response with the users' Aadhaar details
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching user Aadhaar details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProfilePic = async (req, res) => {
  try {
    const { profilePic, userId } = req.body;
    if (!profilePic) {
      return res
        .status(400)
        .json({ message: "Profile picture URL is required" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId, // Extracted from auth middleware
      { profilePic },
      { new: true }
    );
    console.log(updatedUser, "updatedUser");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePic: updatedUser.profilePic,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getUsersByBCategory,
  setReferral,
  updateUserAddressAndAadhar,
  getUserAadhaarDetails,
  updateProfilePic,
};
