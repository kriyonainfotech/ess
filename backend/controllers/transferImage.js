const mongoose = require("mongoose");
const Category = require("../model/category");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dcfm0aowt",
  api_key: "576798684156725",
  api_secret: "bhhXx57-OdaxvDdZOwaUKNvBXOA",
});

// Function to upload image to new Cloudinary account
const transferImage = async (oldUrl) => {
  try {
    console.log("Fetching image:", oldUrl);

    const response = await axios.get(oldUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data, "binary");

    console.log("Uploading to new Cloudinary...");

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "categoryImage" }, // ✅ Uploads to "category" folder
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject(error);
            }
            console.log(
              "✅ Image transferred successfully:",
              result.secure_url
            );
            resolve(result.secure_url);
          }
        )
        .end(imageBuffer);
    });
  } catch (error) {
    console.error("❌ Error transferring image:", error);
    return null;
  }
};

// Function to migrate all category images
const migrateAllCategoryImages = async (req, res) => {
  try {
    // Fetch all categories with images
    const categories = await Category.find({
      image: { $exists: true, $ne: "" },
    });

    if (!categories.length) {
      console.log("❌ No categories found with images.");
      return res
        .status(404)
        .json({ success: false, message: "No categories found with images" });
    }

    console.log(`🔄 Migrating ${categories.length} category images...`);

    let updatedCount = 0;

    for (const category of categories) {
      console.log(`🚀 Migrating category: ${category._id}`);

      const newUrl = await transferImage(category.image);

      if (newUrl) {
        // Update category with new image URL
        await Category.updateOne(
          { _id: category._id },
          { $set: { image: newUrl } }
        );
        console.log(
          `✅ Updated category ${category._id} with new image URL: ${newUrl}`
        );
        updatedCount++;
      } else {
        console.log(`❌ Failed to migrate image for category ${category._id}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Migration completed. Successfully updated ${updatedCount} out of ${categories.length} images.`,
    });
  } catch (error) {
    console.error("❌ Error migrating category images:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};

// Run the migration for all categories
module.exports = {
  migrateAllCategoryImages,
};
