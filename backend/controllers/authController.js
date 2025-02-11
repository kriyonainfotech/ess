const UserModel = require("../model/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
// const { distributeReferralRewards } = require("../services/referralService");
const { sendNotification } = require("./sendController");

const getPublicIdFromUrl = (url) => {
  const regex = /\/(?:v\d+\/)?([^\/]+)\/([^\/]+)\.[a-z]+$/;
  const match = url.match(regex);
  if (match) {
    return `${match[1]}/${match[2]}`; // captures the folder and file name without versioning or extension
  }
  return null;
};

const registerUser = async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting registerUser request`);

  try {
    // Get uploaded files
    const { files } = req;
    console.log("[DEBUG] Uploaded files:", files);

    // Validate file uploads
    if (
      !files?.frontAadhar?.[0] ||
      !files?.backAadhar?.[0] ||
      !files?.profilePic?.[0]
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload all required documents (Front Aadhar, Back Aadhar, and Profile Picture)",
      });
    }

    const {
      name,
      email,
      password,
      phone,
      businessCategory,
      businessName,
      businessAddress,
      businessDetaile,
      fcmToken,
      referralCode,
      // Address fields directly from body
      area,
      city,
      state,
      country,
      pincode,
    } = req.body;

    console.log("[DEBUG] Request body:", req.body);

    // Construct address object directly
    const address = {
      area,
      city,
      state,
      country,
      pincode,
    };

    // Validate address fields
    const requiredAddressFields = [
      "area",
      "city",
      "state",
      "country",
      "pincode",
    ];
    const missingFields = requiredAddressFields.filter(
      (field) => !address[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required address fields: ${missingFields.join(", ")}`,
      });
    }

    // Basic validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Check for existing user
    const [emailExists, phoneExists] = await Promise.all([
      UserModel.exists({ email }).lean(),
      UserModel.exists({ phone }).lean(),
    ]);

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    // Handle referral
    let referrer = null;
    if (referralCode) {
      referrer = await UserModel.findOne({ phone: referralCode })
        .select("_id phone walletBalance")
        .lean();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique ID
    const uniqueId = await generateUniqueId();

    // Create user with all fields
    const user = new UserModel({
      userId: uniqueId,
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      businessCategory,
      businessName,
      businessAddress,
      businessDetaile,
      fcmToken,
      frontAadhar: files.frontAadhar[0].path,
      backAadhar: files.backAadhar[0].path,
      profilePic: files.profilePic[0].path,
      referralCode: uuidv4(),
      referredBy: referrer ? [referrer._id] : [],
      isAdminApproved: false,
      walletBalance: 0,
    });

    // Use transaction for referral updates
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await user.save({ session });

      // Update referrer if exists
      if (referrer) {
        await UserModel.findByIdAndUpdate(
          referrer._id,
          {
            $push: { referrals: user._id },
          },
          { session }
        );

        // Send notification to referrer
        await sendNotification({
          userId: referrer._id,
          title: "New Referral",
          message: `${name} has registered using your referral code!`,
          fcmToken: referrer.fcmToken,
        });
      }

      await session.commitTransaction();
    } catch (error) {
      // If there's an error, delete uploaded files
      try {
        const filesToDelete = [
          files.frontAadhar[0].path,
          files.backAadhar[0].path,
          files.profilePic[0].path,
        ];

        for (const filePath of filesToDelete) {
          const publicId = getPublicIdFromUrl(filePath);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
      } catch (cleanupError) {
        console.error(
          "[ERROR] Failed to cleanup uploaded files:",
          cleanupError
        );
      }

      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    console.log(`Registration completed in ${Date.now() - startTime}ms`);

    return res.status(200).json({
      success: true,
      message: "Registration successful! Awaiting admin approval.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referredBy: referrer?.phone || null,
      },
    });
  } catch (error) {
    console.error("[ERROR] Registration failed:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone and Password are required",
      });
    }

    const user = await UserModel.findOne(
      { phone },
      "-sesended_requests -received_requests"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Phone or Password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Phone or Password",
      });
    }

    // Check if the user is admin approved
    if (!user.isAdminApproved) {
      return res.status(403).json({
        // 403 Forbidden
        success: false,
        message: "Your account is not yet approved by the admin.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login",
      // error: error.message,  // Don't send detailed errors in production
    });
  }
};

const registerUserweb = async (req, res) => {
  try {
    // 1. Validate file uploads
    console.log("[INFO] 🟢 Starting user registration process...");
    const { files } = req;
    if (
      !files?.frontAadhar?.[0] ||
      !files?.backAadhar?.[0] ||
      !files?.profilePic?.[0]
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload all required files" });
    }

    // 2. File size validation
    console.log("[INFO] 📏 Validating file sizes...");
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (
      files.frontAadhar[0].size > MAX_FILE_SIZE ||
      files.backAadhar[0].size > MAX_FILE_SIZE ||
      files.profilePic[0].size > MAX_FILE_SIZE
    ) {
      console.warn("[WARN] ⚠️ File size exceeds the limit");
      return res
        .status(400)
        .json({ success: false, message: "Each file must be less than 2MB" });
    }

    // 3. Extract form data

    const {
      name,
      email,
      password,
      phone,
      address,
      businessCategory,
      businessName,
      businessAddress,
      businessDetaile,
      fcmToken,
      referralCode,
    } = req.body;
    console.log("[INFO] 📝 Extracting form data...", req.body);

    if (!name || !email || !password || !phone || !address) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // 4. Parse address
    console.log("[INFO] 🗺️ Parsing address...");
    let parsedAddress;
    try {
      parsedAddress =
        typeof address === "string" ? JSON.parse(address) : address;
    } catch (err) {
      console.error("[ERROR] ❌ Invalid address format:", err.message);
      return res
        .status(400)
        .json({ success: false, message: "Invalid address format" });
    }

    // 5. Check for existing user and referrer
    console.log("[INFO] 🔎 Checking existing user and referrer...");
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      console.warn("[WARN] ⚠️ User already exists:", existingUser);
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already exists"
            : "Phone number already exists",
      });
    }

    // Find referrer based on referralCode (which is a user ID)
    let referrer = null;
    if (referralCode) {
      referrer = await UserModel.findById(referralCode);
      if (!referrer) {
        console.warn("[WARN] ⚠️ Invalid referral code provided.");
        return res.status(400).json({
          success: false,
          message: "Invalid referral code",
        });
      }
    }

    const uniqueId = await generateUniqueId();

    // 6. Create new user
    console.log("[INFO] 🆕 Creating new user...");
    const user = new UserModel({
      userId: uniqueId,
      name,
      email,
      password: hashedPassword,
      phone,
      address: parsedAddress,
      businessCategory,
      businessName,
      businessAddress,
      businessDetaile,
      fcmToken,
      referralCode,
      referredBy: referrer ? [referrer._id] : [],
      isAdminApproved: false,
      walletBalance: 0,
      earningsHistory: [],
      frontAadhar: files.frontAadhar[0].path,
      backAadhar: files.backAadhar[0].path,
      profilePic: files.profilePic[0].path,
    });

    // 7. Save user and update referrer if applicable
    user.referralCode = user._id;
    await user.save();
    console.log("[SUCCESS] ✅ User registration completed!", user);

    // Update referrer's referral list
    if (referrer) {
      await UserModel.findByIdAndUpdate(referrer._id, {
        $push: { referrals: user._id },
      });
      console.log(`[INFO] 🔗 User added to ${referrer._id}'s referral list`);
    }

    // 9. Generate token
    const token = jwt.sign(
      { id: user._id, isAdminApproved: false },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    console.log("[INFO] 🔐 Generating authentication token...");

    return res.status(200).json({
      success: true,
      message: "Registration successful! Awaiting admin approval.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
      },
      token,
    });
  } catch (error) {
    console.error("[ERROR] ❌ Registration failed:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: error.message,
    });
  }
};

async function generateUniqueId() {
  const counterDoc = await mongoose.connection.db
    .collection("counters")
    .findOneAndUpdate(
      { _id: "userId" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );
  return counterDoc.seq.toString().padStart(3, "0");
}

const updateUsersPaymentVerified = async (req, res) => {
  try {
    const result = await UserModel.updateMany(
      { paymentVerified: false },
      { $set: { paymentVerified: true } }
    );

    return res.status(200).json({
      success: true,
      message: "Added paymentVerified field to existing users",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update users",
      error: error.message,
    });
  }
};

const updateReferralChain = async (referrerId, newUserId) => {
  // Default referral IDs (replace these with actual user IDs from your database)
  const defaultReferrerIds = ["678dd875b7a93b00570bfa5b"];

  // If referrerId is null, assign a random one from the default list
  if (!referrerId) {
    referrerId =
      defaultReferrerIds[Math.floor(Math.random() * defaultReferrerIds.length)];
  }

  const referrer = await UserModel.findById(referrerId);
  if (referrer) {
    if (!referrer.referrals.includes(newUserId)) {
      referrer.referrals.push(newUserId); // Add new user to the referrer's referrals list
      await referrer.save();
    }

    // Recursively update the chain for each referrer in the chain
    if (referrer.referredBy && referrer.referredBy.length > 0) {
      for (const parentReferrerId of referrer.referredBy) {
        await updateReferralChain(parentReferrerId, newUserId); // Call recursively
      }
    }
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
      UserModel.findOne({ phone: referrerPhone }).select("_id name").lean(),
      UserModel.findOne({ phone: referredPhone })
        .select("_id name referredBy")
        .lean(),
    ]);

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

const approveUser = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(req.body);

    // Find the user by ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "User not found" });
    }

    // Update the user's approval status
    user.isAdminApproved = true;
    await user.save();

    return res.status(200).send({
      success: true,
      message: "User approved successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error approving user",
      error: error.message,
    });
  }
};

const loginUserweb = async (req, res) => {
  try {
    console.log(req.body, "body");

    const { phone, password, fcmToken } = req.body; // Include fcmToken in the request body
    if (!phone || !password) {
      return res.status(400).send({
        success: false,
        message: "Phone and Password are required",
      });
    }

    // Check if user exists
    // const user = await UserModel.findOne({ phone });
    const user = await UserModel.findOne({ phone }).select(
      "name phone isAdminApproved password"
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Phone or Password",
      });
    }
    // console.log(user ,"userPhone");

    // Check if user is approved by admin
    if (!user.isAdminApproved) {
      return res.status(400).send({
        success: false,
        message: "Your account is pending admin approval",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Phone or Password",
      });
    }

    // Update FCM token if provided
    if (fcmToken) {
      user.fcmToken = fcmToken; // Ensure your UserModel schema has an `fcmToken` field
      await user.save();
    }

    // Generate token and set cookie
    const token = jwt.sign(
      { id: user._id, isAdminApproved: user.isAdminApproved },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.cookie("refreshToken", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
    });
    console.log("Login successful");

    return res.status(200).json({
      success: true,
      message: `Login successful`,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during login",
      error: error.message,
    });
  }
};

const getAdmin = async (req, res) => {
  try {
    res.status(200).send({
      success: true,
      message: "Welcome, Admin! You have access to this route.",
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during login",
      error: error.message,
    });
  }
};

const getalluser = async (req, res) => {
  try {
    const user = await UserModel.find({})
      .select("-received_requests -sended_requests")
      .populate("referredBy", "name phone");
    // console.log(user.referredBy);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred while fetching users",
      error: error.message,
    });
  }
};

const getUser = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await UserModel.findById(id).select(
      "-received_requests -sended_requests"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User Fetched Succesfully.",
      user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred during userfetch",
      error: error.message,
    });
  }
};

const getUserMobile = async (req, res) => {
  try {
    const userId = req.body.userId; // Extract userId from request body
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await UserModel.findById(userId).select(
      "-received_requests -sended_requests"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred during user fetch.",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    res.setHeader(
      "Set-Cookie",
      "refreshToken=; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=0"
    );

    console.log("Logout successful");

    return res.status(200).send({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during logout",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes you have middleware setting req.user
    const profilePic = req.file ? req.file.path : null;

    console.log(
      req.file,
      "Uploaded File:",
      req.body,
      "Request Body:",
      profilePic
    );

    // Extract fields from the request body
    const {
      name,
      email,
      phone,
      address, // Address should be sent as a JSON object from the frontend
      businessCategory,
      businessName,
      businessAddress,
      businessDetaile,
      fcmToken,
    } = req.body;

    // Prepare the fields to be updated
    const updatedFields = {};

    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (phone) updatedFields.phone = phone;
    if (address) {
      try {
        // If address is sent as a JSON string, parse it
        const parsedAddress =
          typeof address === "string" ? JSON.parse(address) : address;
        updatedFields.address = parsedAddress;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid address format. Address must be a valid JSON object.",
        });
      }
    }
    if (profilePic) updatedFields.profilePic = profilePic;
    if (businessCategory) updatedFields.businessCategory = businessCategory;
    if (businessName) updatedFields.businessName = businessName;
    if (businessAddress) updatedFields.businessAddress = businessAddress;
    if (businessDetaile) updatedFields.businessDetaile = businessDetaile;
    if (fcmToken) updatedFields.fcmToken = fcmToken;

    // Update user data in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true } // Validate fields before updating
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the profile",
      error: error.message,
    });
  }
};

const updateProfileMobile = async (req, res) => {
  try {
    const userId = req.body.userId; // Extract userId from request body
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const profilePic = req.file ? req.file.path : null;

    console.log(
      req.file,
      "Uploaded File:",
      req.body,
      "Request Body:",
      profilePic
    );

    // Extract fields from the request body
    const {
      name,
      email,
      phone,
      address, // Address should be sent as a JSON object from the frontend
      businessCategory,
      businessName,
      businessAddress,
      businessDetaile,
      fcmToken,
    } = req.body;

    // Prepare the fields to be updated
    const updatedFields = {};

    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (phone) updatedFields.phone = phone;
    if (address) {
      try {
        // If address is sent as a JSON string, parse it
        const parsedAddress =
          typeof address === "string" ? JSON.parse(address) : address;
        updatedFields.address = parsedAddress;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid address format. Address must be a valid JSON object.",
        });
      }
    }
    if (profilePic) updatedFields.profilePic = profilePic;
    if (businessCategory) updatedFields.businessCategory = businessCategory;
    if (businessName) updatedFields.businessName = businessName;
    if (businessAddress) updatedFields.businessAddress = businessAddress;
    if (businessDetaile) updatedFields.businessDetaile = businessDetaile;
    if (fcmToken) updatedFields.fcmToken = fcmToken;

    // Update user data in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true } // Validate fields before updating
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the profile",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.body.id;

    // Fetch user before deletion
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    console.log(`[INFO] 🔄 Removing user-related data for user: ${userId}`);

    // Remove the user's requests from both users
    await UserModel.updateMany(
      { "sended_requests.user": userId },
      { $pull: { sended_requests: { user: userId } } }
    );

    await UserModel.updateMany(
      { "received_requests.user": userId },
      { $pull: { received_requests: { user: userId } } }
    );

    console.log("[INFO] ✅ Cleared all related requests");

    // Remove user ID from referrer's referral list if applicable
    if (user.referredBy) {
      await UserModel.updateOne(
        { _id: user.referredBy },
        { $pull: { referrals: userId } }
      );
      console.log("[INFO] ✅ Removed user from referrer’s referral list");
    }

    // Delete user's images from Cloudinary (Aadhar + Profile Pic)
    const cloudinary = require("cloudinary").v2;

    const deleteCloudinaryImage = async (imageUrl) => {
      if (imageUrl) {
        const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID
        await cloudinary.uploader.destroy(publicId);
      }
    };

    await deleteCloudinaryImage(user.profilePic);
    await deleteCloudinaryImage(user.frontAadhar);
    await deleteCloudinaryImage(user.backAadhar);

    console.log(
      "[INFO] ✅ Deleted user's profile and Aadhar images from Cloudinary"
    );

    // Finally, delete user
    await UserModel.findByIdAndDelete(userId);

    console.log("[SUCCESS] 🚀 User deleted successfully");

    return res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("[ERROR] ❌", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while deleting the user",
      error: error.message,
    });
  }
};

const UpdateUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId; // Use authenticated user's ID or extract from body
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const {
      name,
      email,
      phone,
      address,
      businessCategory,
      businessName,
      businessAddress,
      businessDetaile,
    } = req.body;

    // Validate input fields
    if (
      !name &&
      !email &&
      !phone &&
      !address &&
      !businessCategory &&
      !businessName &&
      !businessAddress &&
      !businessDetaile
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields to update provided",
      });
    }

    // Build the update object
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (phone) updatedFields.phone = phone;
    if (address) {
      updatedFields.address = {
        ...address, // Spread operator to handle partial updates
      };
    }
    if (businessCategory) updatedFields.businessCategory = businessCategory;
    if (businessName) updatedFields.businessName = businessName;
    if (businessAddress) updatedFields.businessAddress = businessAddress;
    if (businessDetaile) updatedFields.businessDetaile = businessDetaile;

    // Update user data in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true } // `new` returns updated document, `runValidators` ensures schema validation
    );

    // Handle case when user is not found
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the profile",
      error: error.message,
    });
  }
};
const setUserStatus = async (req, res) => {
  try {
    console.log("🔍 Received request to update user status"); // Log request start

    const userId = req.user?.id; // Ensure user ID is available
    console.log(userId, "userId");
    if (!userId) {
      console.log("❌ User ID missing in request");
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized request" });
    }

    const { userstatus } = req.body;

    // Validate status
    if (!userstatus || !["available", "unavailable"].includes(userstatus)) {
      console.log("❌ Invalid status value:", userstatus);
      return res.status(400).json({
        success: false,
        message:
          "Invalid status value. Please choose 'available' or 'unavailable'.",
      });
    }

    console.log(`🛠 Updating status for user ${userId} to ${userstatus}`);

    // Measure query execution time
    const startTime = Date.now();
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { userstatus } },
      { new: true, select: "userstatus" } // ✅ Returns the updated document with only `userstatus`
    );

    console.log(updatedUser, "updatedUser");
    const endTime = Date.now();
    console.log(`✅ Database update completed in ${endTime - startTime}ms`);

    // If user not found, return an error
    if (!updatedUser) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ User status updated successfully:", updatedUser.userstatus);
    return res.status(200).json({
      success: true,
      message: `User status updated to ${userstatus}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("🔥 Error in setUserStatus:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the user status",
      error: error.message,
    });
  }
};

const setUserStatusMobile = async (req, res) => {
  try {
    const userId = req.body.userId; // Extract userId from request body
    const { userstatus } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Validate userstatus
    if (!userstatus || !["available", "unavailable"].includes(userstatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status value. Please choose 'available' or 'unavailable'.",
      });
    }

    // Update user status in the database
    const updatedUserstatus = await UserModel.findByIdAndUpdate(
      userId,
      { userstatus },
      { new: true, runValidators: true } // Ensure validation is applied
    );

    // If user not found, return an error
    if (!updatedUserstatus) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Respond with success
    return res.status(200).json({
      success: true,
      message: `User status updated to ${userstatus}`,
      user: updatedUserstatus,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the user status",
      error: error.message,
    });
  }
};

const updateRoleByEmail = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Validate role
    if (!role || !["User", "Admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role value. Please choose 'User' or 'Admin'.",
      });
    }

    // Find the user by email and update their role
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: email },
      { role: role },
      { new: true, runValidators: true }
    );

    // If user not found, return an error
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Respond with success
    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the user role",
      error: error.message,
    });
  }
};

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "Gmail", // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Function to send email
const sendEmail = async (to, subject, text) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

// Forgot Password API
const forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;
    console.log(req.body, "Request Body");

    let user;

    // Handle email-based reset
    if (email) {
      user = await UserModel.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Email not found" });
      }

      // Generate 6-digit reset code
      const resetCode = crypto.randomInt(100000, 999999).toString();
      user.resetCode = resetCode;
      user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // Code valid for 10 minutes
      await user.save();
      console.log(user, "user1");
      // Send reset code via email
      await sendEmail(
        email,
        "Password Reset Code",
        `Your password reset code is ${resetCode}`
      );

      return res
        .status(200)
        .json({ success: true, message: "6-digit code sent to your email" });
    }

    // Handle phone-based reset
    if (phone) {
      user = await UserModel.findOne({ phone });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Phone number not found" });
      }
      return res
        .status(200)
        .json({ success: true, message: "Email required for further steps" });
    }

    // If neither email nor phone is provided
    return res
      .status(400)
      .json({ success: false, message: "Email or phone is required" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    console.log(req.body, "rb2");

    const user = await UserModel.findOne({
      email,
      resetCode: code,
      resetCodeExpires: { $gt: Date.now() },
    });
    console.log(user, "user1");

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired code" });

    return res
      .status(200)
      .json({ success: true, message: "Code verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await UserModel.findOne({
      email,
      resetCodeExpires: { $gt: Date.now() },
    });
    console.log(user, "user3");
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset code" });

    // Hash the new password before saving it
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(newPassword, salt); // Hash the password

    // Update the user's password
    user.password = hashedPassword;
    user.resetCode = undefined; // Clear the reset code
    user.resetCodeExpires = undefined; // Clear the expiration time
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getrequests = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(userId);
    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID format" });
    }
    const user = await UserModel.findById(userId)
      .select("sended_requests received_requests")
      .lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "request get successfully",
      user,
    });
  } catch (error) {
    console.log("Error fetching requests:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).select(
      "-received_requests -sended_requests -password -resetCode -resetCodeExpires"
    );
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error fetching user by ID:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerUserweb,
  loginUserweb,
  getalluser,
  getUser,
  getUserMobile,
  logout,
  getAdmin,
  updateProfile,
  updateProfileMobile,
  deleteUser,
  UpdateUser,
  setUserStatus,
  updateRoleByEmail,
  approveUser,
  setUserStatusMobile,
  resetPassword,
  verifyCode,
  forgotPassword,
  setReferral,
  updateUsersPaymentVerified,
  getrequests,
  updateReferralChain,
  getUserById,
};
