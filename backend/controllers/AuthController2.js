const UserModel = require("../model/user");

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
      isAdminApproved: true,
    }).select(
      "_id name email phone businessCategory profilePic address businessName userstatus userAverageRating userRatings providerRatings providerAverageRating"
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

// Add migration function to ensure fields exist for all users
const migrateUserFields = async (req, res) => {
  try {
    console.log("Migrating user fields");
    // Only allow admin to run migration
    // if (req.user.role !== "Admin") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Only admin can perform this action",
    //   });
    // }

    // Update all documents that don't have these fields
    const result = await UserModel.updateMany(
      {
        $or: [
          { permanentAddress: { $exists: false } },
          { aadharNumber: { $exists: false } },
        ],
      },
      {
        $set: {
          permanentAddress: "",
          aadharNumber: "",
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Migration completed successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error in migrateUserFields:", error);
    res.status(500).json({
      success: false,
      message: "Error during migration",
      error: error.message,
    });
  }
};

module.exports = {
  getUsersByBCategory,
  // fixUserData,
  updateUserAddressAndAadhar,
  migrateUserFields,
};
