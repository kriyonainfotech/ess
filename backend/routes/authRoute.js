const express = require("express");
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
  setReferral,
} = require("../controllers/authController");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { sendNotification } = require("../controllers/sendController");
const {
  getUsersByBCategory,
  updateUserAddressAndAadhar,
  migrateUserFields,
} = require("../controllers/AuthController2");
const router = express.Router();

cloudinary.config({
  cloud_name: "dcfm0aowt",
  api_key: "576798684156725",
  api_secret: "bhhXx57-OdaxvDdZOwaUKNvBXOA",
});

// cloudinary.config({
//   cloud_name: "dcfm0aowt",
//   api_key: "576798684156725",
//   api_secret: "bhhXx57-OdaxvDdZOwaUKNvBXOA", // Click 'View API Keys' above to copy your API secret
// });

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
// router.post("/registerUserweb",upload.single("image"), registerUserweb);
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
router.get("/getUserMobile", getUserMobile);
router.get("/logout", logout);
router.put("/setUserStatus", verifyToken, setUserStatus);
router.put("/setUserStatusMobile", setUserStatusMobile);
router.put("/updateRoleByEmail", updateRoleByEmail);
router.post("/getUsersByBCategory", getUsersByBCategory);

// forgotpassword and reset password apis
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);
router.post("/setReferral", setReferral);

// Route to update permanent address and Aadhar number
router.put("/updateUserAddressAndAadhar", updateUserAddressAndAadhar);

// Route to migrate/create fields for existing users (admin only)
router.post("/migrate-user-fields", migrateUserFields);

module.exports = router;
