const UserModel = require("../model/user");

const getUsersByBCategory = async (req, res) => {
  try {
    const { category, city, status, isAdminApproved, sortByRating } = req.body;
    console.log("Request body:", req.body);

    // Let's check users at each filter step to see where they're getting filtered out
    const filter = {};
    let usersAfterEachFilter = [];

    // 1. First check just category
    if (category) {
      filter.businessCategory = { $regex: new RegExp(category, "i") };
      usersAfterEachFilter = await UserModel.find({
        businessCategory: filter.businessCategory,
      }).select(
        "name phone address businessCategory profilePic userstatus ratings averageRating isAdminApproved"
      );
      console.log("Users after category filter:", usersAfterEachFilter.length);
      console.log(
        "User details:",
        usersAfterEachFilter.map((u) => ({
          name: u.name,
          category: u.businessCategory,
          city: u?.address?.city,
          status: u.userstatus,
          isAdminApproved: u.isAdminApproved,
        }))
      );

      // If no users found with this category, return early
      if (usersAfterEachFilter.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No service providers available for this category",
          count: 0,
          users: [],
        });
      }
    }

    // 2. Add city filter
    if (city) {
      filter["address.city"] = { $regex: new RegExp(city, "i") };
      usersAfterEachFilter = await UserModel.find({
        businessCategory: filter.businessCategory,
        "address.city": filter["address.city"],
      }).select(
        "name phone address businessCategory profilePic userstatus ratings averageRating isAdminApproved"
      );

      // If no users found after city filter
      if (usersAfterEachFilter.length === 0) {
        return res.status(200).json({
          success: true,
          message: `No service providers available in ${city} for this category`,
          count: 0,
          users: [],
        });
      }
    }

    // 3. Add status filter
    if (status) {
      const validStatuses = ["available", "unavailable"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        });
      }
      filter.userstatus = status;
      usersAfterEachFilter = await UserModel.find({
        ...filter,
      }).select(
        "name phone address businessCategory profilePic userstatus ratings averageRating isAdminApproved"
      );

      // If no users found after status filter
      if (usersAfterEachFilter.length === 0) {
        return res.status(200).json({
          success: true,
          message: `No ${status} service providers found for this category`,
          count: 0,
          users: [],
        });
      }
    }

    // 4. Add admin approval filter
    if (isAdminApproved !== undefined) {
      filter.isAdminApproved = isAdminApproved;
      usersAfterEachFilter = await UserModel.find(filter).select(
        "name phone address businessCategory profilePic userstatus ratings averageRating isAdminApproved"
      );

      // If no users found after admin approval filter
      if (usersAfterEachFilter.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No approved service providers available for this category",
          count: 0,
          users: [],
        });
      }
    }

    // Sort users if requested
    if (sortByRating && usersAfterEachFilter.length > 0) {
      if (!["asc", "desc"].includes(sortByRating)) {
        return res.status(400).json({
          success: false,
          message: "sortByRating must be either 'asc' or 'desc'",
        });
      }

      usersAfterEachFilter.sort((a, b) => {
        const ratingA = a.averageRating || 0;
        const ratingB = b.averageRating || 0;
        return sortByRating === "desc" ? ratingB - ratingA : ratingA - ratingB;
      });
    }

    // Return success response with users
    return res.status(200).json({
      success: true,
      message:
        usersAfterEachFilter.length > 0
          ? "Service providers fetched successfully"
          : "No service providers available",
      count: usersAfterEachFilter.length,
      filters: {
        category,
        city,
        status,
        isAdminApproved,
        sortByRating,
      },
      users: usersAfterEachFilter,
    });
  } catch (error) {
    console.error("Error in getUsersByBCategory:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch service providers. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// const getUsersByBCategory = async (req, res) => {
//   const { category, city, status, isAdminApproved, sortByRating } = req.body;

//   console.log("Received category:", category); // Debug: Log the received category
//   console.log("Received city:", city); // Debug: Log the received city

//   const filter = {};

//   if (category) {
//     filter.businessCategory = { $in: [category] }; // Exact match for category
//   }

//   if (city) {
//     filter["address.city"] = city; // Exact match for city
//   }

//   if (status) {
//     filter.userstatus = status; // Filter by user status
//   }

//   if (isAdminApproved !== undefined) {
//     filter.isAdminApproved = isAdminApproved; // Filter by admin approval status
//   }

//   try {
//     console.log("Filter object:", filter);

//     // Fetch only the required fields
//     // let users = await UserModel.find(filter);
//     let users = await UserModel.find(filter).select(
//       "name phone address businessCategory profilePic userstatus ratings averageRating"
//     );

//     console.log("Fetched users:", users);

//     // Sort by averageRating if requested
//     if (sortByRating === "desc") {
//       users.sort((a, b) => b.averageRating - a.averageRating);
//     } else if (sortByRating === "asc") {
//       users.sort((a, b) => a.averageRating - b.averageRating);
//     }

//     res.status(200).send({
//       success: true,
//       message: "Users fetched successfully",
//       users,
//     });
//   } catch (error) {
//     console.log("Error fetching filtered users:", error);
//     res
//       .status(500)
//       .send({ success: false, message: "Internal server error", error });
//   }
// };

module.exports = {
  getUsersByBCategory,
};
