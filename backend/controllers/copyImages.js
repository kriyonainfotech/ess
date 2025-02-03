const cloudinary = require("cloudinary").v2;
const User = require("../model/user");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
router.get("/copy-user-images", copySingleUserImages);

const writeFileAsync = promisify(fs.writeFile);
const unlinkFileAsync = promisify(fs.unlink);

const uploadToNewCloudinary = async (imageUrl, folder, key) => {
  try {
    console.log(`Starting upload to new Cloudinary: ${imageUrl} → ${folder}`);

    // Reconfigure Cloudinary with new credentials before each upload
    cloudinary.config({
      cloud_name: "dcfm0aowt",
      api_key: "576798684156725",
      api_secret: "bhhXx57-OdaxvDdZOwaUKNvBXOA",
    });

    console.log("New Cloudinary Config:", cloudinary.config());

    // Generate a unique filename using timestamp and random string
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const tempPath = path.join(__dirname, `${key}-${uniqueId}.jpg`);

    // Download the image
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    await writeFileAsync(tempPath, response.data);

    console.log(`✅ Image downloaded successfully: ${tempPath}`);

    // Upload to new Cloudinary
    const result = await cloudinary.uploader.upload(tempPath, {
      folder,
      use_filename: true,
      unique_filename: false,
      public_id: `${key}-${uniqueId}`, // Ensures unique name on Cloudinary
    });

    // Clean up temporary file
    await unlinkFileAsync(tempPath);

    console.log(`✅ Upload success (NEW CLOUDINARY): ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Upload failed for ${imageUrl}:`, error.message);
    return null;
  }
};

// Copy images for a single user by ID
const copySingleUserImages = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(`Fetching user: ${userId}`);

    // Find user by ID
    const user = await User.findById(userId).select(
      "profilePic frontAadhar backAadhar"
    );
    if (!user) {
      console.log(`User not found: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`User found: ${userId}`);
    console.log("Existing image URLs:", {
      profilePic: user.profilePic,
      frontAadhar: user.frontAadhar,
      backAadhar: user.backAadhar,
    });

    let updatedImages = {};
    let oldImages = {
      profilePic: user.profilePic,
      frontAadhar: user.frontAadhar,
      backAadhar: user.backAadhar,
    };

    // Upload each image to the new Cloudinary account
    for (let key of ["profilePic", "frontAadhar", "backAadhar"]) {
      if (user[key]) {
        console.log(`Processing ${key}: ${user[key]}`);
        const newUrl = await uploadToNewCloudinary(user[key], "users", key);
        if (newUrl) {
          updatedImages[key] = newUrl;
        } else {
          console.error(`Failed to upload ${key} for user ${userId}`);
        }
      } else {
        console.log(`Skipping ${key}: No existing image.`);
      }
    }

    console.log(`Final uploaded images:`, updatedImages);

    // Update user with new image URLs
    await User.findByIdAndUpdate(user._id, {
      $set: { oldImages, newImages: updatedImages },
    });

    console.log(`User updated successfully: ${userId}`);

    res.json({
      message: "Images copied successfully",
      user: { _id: user._id, oldImages, newImages: updatedImages },
    });
  } catch (error) {
    console.error(`Error processing user ${userId}:`, error.message);
    res
      .status(500)
      .json({ message: "Failed to copy images", error: error.message });
  }
};

module.exports = { copySingleUserImages };
