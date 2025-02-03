const Banner = require("../model/banner");
const cloudinary = require("cloudinary").v2;
const Category = require("../model/category");
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
        .json({ success: false, message: "category not found" });
    }
    let imageUrl = category.image;
    if (req.file) {
      if (imageUrl) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          const result = await cloudinary.uploader.destroy(publicId);
        } else {
          console.log("Could not extract publicId from URL:", imageUrl);
        }
      }
      imageUrl = req.file.path;
    }
    category.imageUrl = imageUrl;
    category.categoryName = categoryName;
    await category.save();
    res.status(200).json({
      success: true,
      message: "banner updated successfully",
      category,
    });
  } catch (error) {
    console.error("Error in bannerupdate:", error);
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
// const getAllCategory = async (req, res) => {
//   try {
//     const category = await Category.find({}).sort({ categoryName: 1 });
//     return res.status(200).send({
//       success: true,
//       message: "Banners fetched successfully",
//       category,
//     });
//   } catch (error) {
//     console.error("Error :", error);
//     res.status(500).json({ success: false, message: "Server error", error });
//   }
// };

const getAllCategory = async (req, res) => {
  try {
    const { page = 1, limit = 20, scroll = false } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Get total count of categories
    const totalCount = await Category.countDocuments({});

    // Calculate skip value for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Base query
    let query = Category.find({}).sort({ categoryName: 1 });

    // If scroll mode is true, get all categories up to the current page
    if (scroll === "true") {
      query = query.limit(pageNumber * limitNumber);
    } else {
      // For regular pagination, get only the current page
      query = query.skip(skip).limit(limitNumber);
    }

    // Execute query
    const categories = await query;

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limitNumber);

    // Debug information
    console.log(
      {
        page: pageNumber,
        limit: limitNumber,
        skip,
        totalCount,
        totalPages,
        categoriesLength: categories.length,
        scroll,
      },
      "Pagination/Scroll Debug"
    );

    return res.status(200).json({
      success: true,
      category: categories,
      pagination: {
        totalCount,
        currentPage: pageNumber,
        totalPages,
        hasMore: pageNumber < totalPages,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      category: [],
      pagination: {
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
        limit: 20,
      },
    });
  }
};

// const getAllCategory = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, scroll = false } = req.query;
//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);

//     // Get total count of categories
//     const totalCount = await Category.countDocuments({});

//     // Calculate skip value for pagination
//     const skip = (pageNumber - 1) * limitNumber;

//     // Base query
//     let query = Category.find({}).sort({ categoryName: 1 });

//     // If scroll mode is true, get all categories up to the current page
//     if (scroll === 'true') {
//       query = query.limit(pageNumber * limitNumber);
//     } else {
//       // For regular pagination, get only the current page
//       query = query.skip(skip).limit(limitNumber);
//     }

//     // Execute query
//     const categories = await query;

//     // Calculate total pages
//     const totalPages = Math.ceil(totalCount / limitNumber);

//     // Debug information
//     console.log({
//       page: pageNumber,
//       limit: limitNumber,
//       skip,
//       totalCount,
//       totalPages,
//       categoriesLength: categories.length,
//       scroll,
//     }, "Pagination/Scroll Debug");

//     return res.status(200).json({
//       success: true,
//       category: categories,
//       pagination: {
//         totalCount,
//         currentPage: pageNumber,
//         totalPages,
//         hasMore: pageNumber < totalPages,
//         limit: limitNumber,
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//       category: [],
//       pagination: {
//         totalCount: 0,
//         currentPage: 1,
//         totalPages: 1,
//         hasMore: false,
//         limit: 20,
//       }
//     });
//   }
// };

module.exports = {
  addCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
};
