const Banner = require("../model/banner");
const cloudinary = require("cloudinary").v2;
const Category = require("../model/category");
const User = require("../model/user");

const getPublicIdFromUrl = (url) => {
  const regex = /\/(?:v\d+\/)?([^\/]+)\/([^\/]+)\.[a-z]+$/;
  const match = url.match(regex);
  if (match) {
    return `${match[1]}/${match[2]}`; // captures the folder and file name without versioning or extension
  }
  return null;
};

const addCategory = async (req, res) => {
  try {
    const { categoryName } = req.body; // Extract category name from the request body
    const imageUrl = req.file.path; // Extract uploaded image URL from Cloudinary

    // Check if category already exists
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).send({
        success: false,
        message: "Category already exists",
      });
    }

    // Create a new category
    const category = new Category({
      categoryName,
      image: imageUrl,
    });

    // Save category to the database
    await category.save();

    return res.status(201).send({
      success: true,
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while adding the category",
      error: error.message,
    });
  }
};
const updateCategory = async (req, res) => {
  try {
    const { categorId, categoryName } = req.body;
    const category = await Category.findById(categorId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    let imageUrl = category.image; // Keep existing image if no new image is uploaded

    if (req.file) {
      // Delete the old image from Cloudinary
      if (imageUrl) {
        const publicId = getPublicIdFromUrl(imageUrl); // Extract Cloudinary public ID
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        } else {
          console.log("Could not extract publicId from URL:", imageUrl);
        }
      }

      // Save the new image URL
      imageUrl = req.file.path;
    }

    category.image = imageUrl; // Ensure the field name matches the database
    category.categoryName = categoryName;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    console.log(req.body);

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "category not found" });
    }
    if (category.image) {
      const publicId = getPublicIdFromUrl(category.image);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary deletion result:", result);
      } else {
        console.log(
          "Could not extract publicId from image URL:",
          category.image
        );
      }
    }
    await Category.findByIdAndDelete(categoryId);

    res
      .status(200)
      .json({ success: true, message: "category deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const getAllCategory = async (req, res) => {
  try {
    // Fetch all unique categories and sort them alphabetically by categoryName
    const categories = await Category.aggregate([
      // First stage: Group by categoryName to remove duplicates
      {
        $group: {
          _id: {
            categoryName: { $toLower: "$categoryName" }, // Convert to lowercase for case-insensitive grouping
          },
          originalId: { $first: "$_id" },
          categoryName: { $first: "$categoryName" },
          image: { $first: "$image" },
        },
      },
      // Second stage: Sort alphabetically
      {
        $sort: {
          "_id.categoryName": 1,
        },
      },
      // Third stage: Project the final format
      {
        $project: {
          _id: "$originalId",
          categoryName: "$categoryName",
          image: "$image",
        },
      },
    ]).collation({ locale: "en", strength: 2 }); // Case-insensitive comparison

    // Additional check to ensure no duplicates
    const uniqueCategories = Array.from(
      new Map(
        categories.map((item) => [item.categoryName.toLowerCase(), item])
      ).values()
    );

    return res.status(200).send({
      success: true,
      message: "Categories fetched successfully",
      category: uniqueCategories,
    });
  } catch (error) {
    console.error("[ERROR] Failed to fetch categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

module.exports = {
  addCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
};
