const express = require("express");
const User = require("../model/user");
const {
  registerUser,
  loginUser,
  registerUserweb,
  loginUserweb,
  getalluser,
  getUser,
  logout,
  getAdmin,
  updateProfile,
  deleteUser,
  UpdateUser,
  updateRoleByEmail,
  setUserStatus,
  approveUser,
  updateProfileMobile,
  getUserMobile,
  setUserStatusMobile,
  getUsersByCategory,
  forgotPassword,
  verifyCode,
  resetPassword,
  getUserById,
} = require("../controllers/authController");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { sendNotification } = require("../controllers/sendController");
const {
  getUsersByBCategory,
  updateUserAddressAndAadhar,
  setReferral,
  deleteAdharPics,
} = require("../controllers/AuthController2");
const router = express.Router();

cloudinary.config({
  cloud_name: "dcfm0aowt",
  api_key: "576798684156725",
  api_secret: "bhhXx57-OdaxvDdZOwaUKNvBXOA",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [
      {
        crop: "fill",
        gravity: "center",
        quality: "auto:best", // Automatically optimizes quality while maintaining visual fidelity
      },
    ],
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/registerUser",
  upload.fields([
    { name: "frontAadhar", maxCount: 1 },
    { name: "backAadhar", maxCount: 1 },
    { name: "profilePic", maxCount: 1 },
  ]),
  registerUser
);
router.post("/loginUser", loginUser);
router.post(
  "/registerUserweb",
  upload.fields([
    { name: "frontAadhar", maxCount: 1 },
    { name: "backAadhar", maxCount: 1 },
    { name: "profilePic", maxCount: 1 },
  ]),

  registerUserweb
);
router.post("/loginUserweb", loginUserweb);
router.put("/approveUser", approveUser);

router.post(
  "/updateProfile",
  verifyToken,
  upload.single("profilePic"),
  updateProfile
);

router.post("/updateProfileMobile", updateProfileMobile);
router.delete("/deleteUser", deleteUser);
router.put("/UpdateUser", UpdateUser);
router.get("/getAdmin", isAdmin, getAdmin);
router.get("/getAllUser", getalluser);
router.get("/getUser", verifyToken, getUser);
router.get("/getUserById/:id", getUserById);
router.get("/getUserMobile", getUserMobile);
router.get("/logout", logout);
router.put("/setUserStatus", verifyToken, setUserStatus);
router.put("/setUserStatusMobile", setUserStatusMobile);
router.put("/updateRoleByEmail", updateRoleByEmail);
router.post("/getUsersByBCategory", getUsersByBCategory);

router.delete("/delete-aadhar", deleteAdharPics);

// forgotpassword and reset password apis
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);
router.post("/setReferral", setReferral);

// Route to update permanent address and Aadhar number
router.put("/updateUserAddressAndAadhar", updateUserAddressAndAadhar);

const DEFAULT_PROFILE_PIC =
  "https://res.cloudinary.com/dcfm0aowt/image/upload/v1739604108/user/phnbhd4onynoetzdxqjp.jpg";

// Get all users' profile picture URLs
router.get("/profile-pics", async (req, res) => {
  try {
    const users = await User.find({}, "profilePic"); // Fetch only profilePic field
    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        if (
          user.profilePic?.includes(
            "https://res.cloudinary.com/dosudib3y/image/"
          )
        ) {
          // Update in MongoDB
          await User.findByIdAndUpdate(user._id, {
            profilePic: DEFAULT_PROFILE_PIC,
          });

          return {
            userId: user._id,
            profilePic: DEFAULT_PROFILE_PIC, // Replaced URL
          };
        }
        return {
          userId: user._id,
          profilePic: user.profilePic || null, // Original URL or null
        };
      })
    );

    res.json({ success: true, data: updatedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
