const UserModel = require("../model/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const { distributeReferralRewards } = require("../services/referralService");
const { sendNotification } = require("./sendController");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmpassword,
      phone,
      address,
      businessCategory,
      businessName,
      businessAddress,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !confirmpassword ||
      !phone ||
      !address
    ) {
      return res.status(400).send({
        success: false,
        message: "Please fill all the fields",
      });
    }

    if (password !== confirmpassword) {
      return res.status(400).send({
        success: false,
        message: "Password and Confirm Password don't match",
      });
    }

    const userExist = await UserModel.findOne({ email: email });
    if (userExist) {
      return res.status(400).send({
        success: false,
        message: "Email already exists",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new UserModel({
      name,
      email,
      password: hashedPassword, // Store hashed password
      phone,
      address,
      businessCategory,
      businessName,
      businessAddress,
    });
    await user.save();

    return res.status(200).send({
      success: true,
      message: "User registered successfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred during registration",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).send({
        success: false,
        message: "Phone and Password are required",
      });
    }
    const user = await UserModel.findOne({ phone });
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
    // console.log(user,'user')
    return res.status(200).json({
      success: true,
      message: `Login successful`,
      user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred during login",
      error: error.message,
    });
  }
};

// const registerUserweb = async (req, res) => {
//   try {
//     // Check if all required files are uploaded
//     if (
//       !req.files ||
//       !req.files.frontAadhar ||
//       !req.files.frontAadhar[0].path ||
//       !req.files.backAadhar ||
//       !req.files.backAadhar[0].path ||
//       !req.files.profilePic ||
//       !req.files.profilePic[0].path
//     ) {
//       return res
//         .status(400)
//         .send({ message: "Please upload all required files." });
//     }
//     const MAX_FILE_SIZE = 2 * 1024 * 1024; // **2MB file size limit**

//     const files = req.files;
//     if (
//       (files.frontAadhar && files.frontAadhar[0].size > MAX_FILE_SIZE) ||
//       (files.backAadhar && files.backAadhar[0].size > MAX_FILE_SIZE) ||
//       (files.profilePic && files.profilePic[0].size > MAX_FILE_SIZE)
//     ) {
//       return res
//         .status(400)
//         .json({ message: "File size must be less than 2GB" });
//     }
//     // Get the URLs of the uploaded files from Cloudinary
//     const frontAadharUrl = req.files.frontAadhar[0].path;
//     const backAadharUrl = req.files.backAadhar[0].path;
//     const profilePicUrl = req.files.profilePic[0].path;

//     // console.log(frontAadharUrl, "frontAadharUrl");
//     // console.log(backAadharUrl, "backAadharUrl");
//     // console.log(profilePicUrl, "profilePicUrl");

//     // You can now proceed with further processing, such as saving the URLs to the database

//     const {
//       name,
//       email,
//       password,
//       confirmpassword,
//       phone,
//       address,
//       businessCategory,
//       businessName,
//       businessAddress,
//       businessDetaile,
//       fcmToken,
//     } = req.body;
//     // Parse the address from JSON string to object
//     let parsedAddress = {};
//     if (address) {
//       console.log("Address received:", address);
//       try {
//         parsedAddress = JSON.parse(address); // Safely parse if it's a valid JSON string
//       } catch (err) {
//         return res.status(400).send({
//           success: false,
//           message:
//             "Invalid address format. Please provide a valid JSON string.",
//         });
//       }
//     } else {
//       return res.status(400).send({
//         success: false,
//         message: "Address is required.",
//       });
//     }

//     const { area, city, state, country, pincode } = parsedAddress; // Destructure address

//     // Log or process the form data
//     console.log({
//       name,
//       email,
//       phone,
//       password,
//       confirmpassword,
//       area,
//       city,
//       state,
//       country,
//       pincode,
//       businessCategory,
//       businessName,
//       businessAddress,
//       businessDetaile,
//       fcmToken,
//     });
//     // console.log(req.body,"all data");

//     const referralCode = req.body.referralCode;

//     // Check for required fields
//     if (
//       !name ||
//       !email ||
//       !password ||
//       !confirmpassword ||
//       !phone ||
//       !area ||
//       !city ||
//       !state ||
//       !country ||
//       !pincode
//     ) {
//       console.log("Please fill all the fields");
//       return res
//         .status(400)
//         .send({ success: false, message: "Please fill all the fields" });
//     }

//     // Validate password and confirm password
//     if (password !== confirmpassword) {
//       return res.status(400).send({
//         success: false,
//         message: "Password and Confirm Password don't match",
//       });
//     }

//     // Check if email already exists
//     const userExist = await UserModel.findOne({ phone: phone });
//     if (userExist) {
//       return res
//         .status(400)
//         .send({ success: false, message: "Number already exists" });
//     }
//     const EmailExist = await UserModel.findOne({ email: email });
//     if (EmailExist) {
//       return res
//         .status(400)
//         .send({ success: false, message: "Email already exists" });
//     }

//     const counterDoc = await mongoose.connection.db
//       .collection("counters")
//       .findOne({ _id: "userId" });

//     if (!counterDoc) {
//       // Initialize the counter if it doesn't exist
//       await mongoose.connection.db
//         .collection("counters")
//         .insertOne({ _id: "userId", seq: 1 });
//     }

//     const updatedCounterDoc = await mongoose.connection.db
//       .collection("counters")
//       .findOneAndUpdate(
//         { _id: "userId" },
//         { $inc: { seq: 1 } },
//         { returnDocument: "after" }
//       );

//     if (!updatedCounterDoc) {
//       return res.status(500).send({
//         success: false,
//         message: "Failed to retrieve or increment counter",
//       });
//     }

//     const uniqueId = updatedCounterDoc.seq.toString().padStart(3, "0");
//     console.log("Generated User ID:", uniqueId);
//     // refrals
//     let referrer = null;
//     if (referralCode) {
//       referrer = await UserModel.findOne({ phone: referralCode });
//       // console.log(referrer);
//     }

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Generate a unique referral code for the new user
//     const newReferralCode = uuidv4();

//     // Create new user with default wallet balance of 0
//     const user = new UserModel({
//       userId: uniqueId,
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       address: { area, city, state, country, pincode },
//       businessCategory,
//       businessName,
//       businessAddress,
//       businessDetaile,
//       fcmToken,
//       referralCode: newReferralCode,
//       referredBy: referrer ? [referrer._id] : [],
//       isAdminApproved: false,
//       walletBalance: 0,
//       frontAadhar: frontAadharUrl,
//       backAadhar: backAadharUrl,
//       profilePic: profilePicUrl,
//     });

//     // Save the user to the database
//     await user.save();

//     // Update referral chain and distribute rewards if a referrer exists
//     if (referrer) {
//       await distributeReferralRewards(referrer._id, 20, user._id); // Direct referrer gets ₹20
//       await updateReferralChain(referrer._id, user._id); // Update the referral chain

//       let currentReferrer = referrer;
//       let levels = [20, 15, 10, 5]; // Rewards for 2nd to 5th level
//       for (let i = 0; i < levels.length; i++) {
//         if (currentReferrer.referredBy.length > 0) {
//           const nextReferrer = await UserModel.findById(
//             currentReferrer.referredBy[0]
//           );
//           if (nextReferrer) {
//             await distributeReferralRewards(
//               nextReferrer._id,
//               levels[i],
//               user._id
//             );
//             currentReferrer = nextReferrer;
//           } else {
//             break; // Stop if there is no next level referrer
//           }
//         } else {
//           break; // Stop if there are no more referrers in the chain
//         }
//       }
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user._id, isAdminApproved: false },
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     // Set the token as a cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "None",
//       maxAge: 3600000, // 1 hour
//     });

//     // Generate referral link for the new user
//     const referralLink = `${process.env.API_URL}/auth/registerUserweb?referralCode=${newReferralCode}`;

//     if (referrer) {
//       const notification = {
//         senderName: user.name, // New user's name
//         fcmToken: referrer.fcmToken, // Referrer's FCM token
//         title: "New Joining",
//         message: `${user.name} has signed up using your referral link!`,
//         receiverId: referrer._id, // Referrer's ID for tracking
//       };

//       // Send the notification
//       await sendNotification(notification);
//     }

//     // Respond with success
//     return res.status(200).send({
//       success: true,
//       message: "User registered successfully, awaiting admin approval",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         referralCode: newReferralCode,
//         referralLink,
//       },
//       token,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       message: "An error occurred during registration",
//       error: error.message,
//     });
//   }
// };

const registerUserweb = async (req, res) => {
  try {
    console.log("[INFO] Register API called", req.body);

    if (
      !req.files ||
      !req.files.frontAadhar ||
      !req.files.backAadhar ||
      !req.files.profilePic
    ) {
      console.log("[ERROR] Missing required files", req.files);
      return res
        .status(400)
        .send({ message: "Please upload all required files." });
    }

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const files = req.files;
    if (
      files.frontAadhar[0].size > MAX_FILE_SIZE ||
      files.backAadhar[0].size > MAX_FILE_SIZE ||
      files.profilePic[0].size > MAX_FILE_SIZE
    ) {
      console.log("[ERROR] File size exceeds 2MB", files);
      return res
        .status(400)
        .json({ message: "File size must be less than 2MB" });
    }

    const frontAadharUrl = files.frontAadhar[0].path;
    const backAadharUrl = files.backAadhar[0].path;
    const profilePicUrl = files.profilePic[0].path;
    console.log("[INFO] Uploaded file URLs", {
      frontAadharUrl,
      backAadharUrl,
      profilePicUrl,
    });

    const {
      name,
      email,
      password,
      confirmpassword,
      phone,
      address,
      businessCategory,
      businessName,
      businessAddress,
      businessDetaile,
      fcmToken,
    } = req.body;
    if (!address) {
      console.log("[ERROR] Address is missing");
      return res
        .status(400)
        .send({ success: false, message: "Address is required." });
    }

    let parsedAddress;
    try {
      parsedAddress = JSON.parse(address);
    } catch (err) {
      console.log("[ERROR] Invalid address format", err);
      return res
        .status(400)
        .send({ success: false, message: "Invalid address format." });
    }

    const { area, city, state, country, pincode } = parsedAddress;
    console.log("[INFO] Parsed Address", parsedAddress);

    if (
      !name ||
      !email ||
      !password ||
      !confirmpassword ||
      !phone ||
      !area ||
      !city ||
      !state ||
      !country ||
      !pincode
    ) {
      console.log("[ERROR] Missing required fields", req.body);
      return res
        .status(400)
        .send({ success: false, message: "Please fill all the fields" });
    }

    if (password !== confirmpassword) {
      console.log("[ERROR] Passwords do not match");
      return res.status(400).send({
        success: false,
        message: "Password and Confirm Password don't match",
      });
    }

    const userExist = await UserModel.findOne({ phone });
    if (userExist) {
      console.log("[ERROR] Phone number already exists", phone);
      return res
        .status(400)
        .send({ success: false, message: "Number already exists" });
    }

    const emailExist = await UserModel.findOne({ email });
    if (emailExist) {
      console.log("[ERROR] Email already exists", email);
      return res
        .status(400)
        .send({ success: false, message: "Email already exists" });
    }

    const updatedCounterDoc = await mongoose.connection.db
      .collection("counters")
      .findOneAndUpdate(
        { _id: "userId" },
        { $inc: { seq: 1 } },
        { returnDocument: "after" }
      );

    if (!updatedCounterDoc) {
      return res.status(500).send({
        success: false,
        message: "Failed to retrieve or increment counter",
      });
    }

    const uniqueId = updatedCounterDoc.seq.toString().padStart(3, "0");
    console.log("[INFO] Generated User ID", uniqueId);

    let referrer = null;
    if (req.body.referralCode) {
      referrer = await UserModel.findOne({ phone: req.body.referralCode });
      console.log("[INFO] Referrer found", referrer);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("[INFO] Password hashed");

    const newReferralCode = uuidv4();
    const user = new UserModel({
      userId: uniqueId,
      name,
      email,
      password: hashedPassword,
      phone,
      address: { area, city, state, country, pincode },
      businessCategory,
      businessName,
      businessAddress,
      businessDetaile,
      fcmToken,
      referralCode: newReferralCode,
      referredBy: referrer ? [referrer._id] : [],
      isAdminApproved: false,
      walletBalance: 0,
      frontAadhar: frontAadharUrl,
      backAadhar: backAadharUrl,
      profilePic: profilePicUrl,
    });

    await user.save();
    console.log("[INFO] User saved successfully", user._id);

    if (referrer) {
      await distributeReferralRewards(referrer._id, 20, user._id);
      console.log("[INFO] Referral rewards distributed");
    }

    const token = jwt.sign(
      { id: user._id, isAdminApproved: false },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 3600000,
    });

    console.log("[INFO] User registered successfully", user._id);
    return res.status(200).send({
      success: true,
      message: "User registered successfully, awaiting admin approval",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: newReferralCode,
      },
      token,
    });
  } catch (error) {
    console.log("[ERROR] Registration failed", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during registration",
      error: error.message,
    });
  }
};

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
    const { referrerPhone, referredPhone } = req.body; // referrer is user1, referred is user2

    // Validate input
    if (!referrerPhone || !referredPhone) {
      return res.status(400).json({
        message: "Both referrer and referred phone numbers are required.",
      });
    }

    // Find both users by their phone numbers
    const referrer = await UserModel.findOne({ phone: referrerPhone });
    const referred = await UserModel.findOne({ phone: referredPhone });

    if (!referrer || !referred) {
      return res.status(404).json({ message: "One or both users not found." });
    }

    // Check if referred user already has a referrer
    if (referred.referredBy.length > 0) {
      return res
        .status(400)
        .json({ message: "Referred user already has a referrer." });
    }

    referred.referredBy = [referrer._id];
    await referred.save();

    referrer.referrals.push(referred._id);
    await referrer.save(); // Save the referrer referrer.referrals.push(referred._id);

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
    // console.log(user);

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
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while updating the profile",
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
    const userId = req.user.id; // Assuming the user ID is in `req.user` after authentication

    const { userstatus } = req.body;

    // Validate status
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

// const getUsersByCategory = async (req, res) => {
//   try {
//     const { businessCategory } = req.body; // Extract businessCategory from the request body

//     // Validate businessCategory
//     if (!businessCategory) {
//       return res.status(400).json({
//         success: false,
//         message: "businessCategory is required and must be an array.",
//       });
//     }

//     // Find users by businessCategory
//     const users = await UserModel.find({
//       businessCategory: { $in: businessCategory },
//     }).select(
//       "-password -received_requests -sended_requests -frontAadhar -backAadhar -fcmToken -earningsHistory -paymentHistory -referrals -notifications -referredBy -earnings -walletBalance "
//     ); // Exclude sensitive or unwanted fields

//     if (users.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No users found for the specified category",
//       });
//     }

//     // Respond with the list of users
//     return res.status(200).json({
//       success: true,
//       message: "Users fetched successfully.",
//       users,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching users",
//       error: error.message,
//     });
//   }
// };

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

module.exports = {
  registerUser,
  loginUser,
  registerUserweb,
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
};
