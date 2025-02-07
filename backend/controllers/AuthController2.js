const UserModel = require("../model/user");

// const getUsersByBCategory = async (req, res) => {
//   try {
//     const { category, city, sortByRating } = req.body;
//     console.log(category, city, sortByRating);
//     // Validate input
//     if (!category || !city) {
//       return res
//         .status(400)
//         .json({ message: "Category and City are required." });
//     }

//     // Query users based on filters
//     const users = await UserModel.find({
//       businessCategory: category, // Matches the category
//       "address.city": city, // Matches the city
//       userstatus: "available", // User must be available
//       isAdminApproved: true, // Must be admin approved
//     }).sort({ averageRating: sortByRating === "desc" ? -1 : 1 });

//     res.status(200).json(users);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }

//   // try {
//   //   const { category, city, status, isAdminApproved, sortByRating } = req.body;

//   //   console.log("[DEBUG] Request body:", {
//   //     category,
//   //     city,
//   //     status,
//   //     isAdminApproved,
//   //     sortByRating,
//   //   });

//   //   // Build filter object
//   //   const filter = {
//   //     isAdminApproved: true,
//   //   };

//   //   // Add category filter if provided - Fix RegExp construction
//   //   if (category) {
//   //     filter.businessCategory = category; // Simple exact match first
//   //   }

//   //   // Add city filter if provided - Fix RegExp construction
//   //   if (city) {
//   //     filter["address.city"] = city; // Simple exact match first
//   //   }

//   //   // Add status filter if provided
//   //   if (status) {
//   //     filter.userstatus = status;
//   //   }

//   //   console.log("[DEBUG] Final filter:", JSON.stringify(filter, null, 2));

//   //   // Add timeout to the query
//   //   const users = await UserModel.find(filter)
//   //     .select(
//   //       "name phone address businessCategory profilePic userstatus ratings averageRating"
//   //     )
//   //     .lean()
//   //     .maxTimeMS(10000) // 10 second timeout
//   //     .exec();

//   //   console.log("[DEBUG] Found users count:", users.length);

//   //   if (users.length === 0) {
//   //     // Diagnostic queries with timeouts
//   //     const [totalUsers, usersWithCategory] = await Promise.all([
//   //       UserModel.countDocuments().maxTimeMS(5000),
//   //       category
//   //         ? UserModel.countDocuments({ businessCategory: category }).maxTimeMS(
//   //             5000
//   //           )
//   //         : Promise.resolve(0),
//   //     ]);

//   //     console.log("[DEBUG] Total users in database:", totalUsers);
//   //     if (category) {
//   //       console.log(
//   //         "[DEBUG] Users with category:",
//   //         category,
//   //         ":",
//   //         usersWithCategory
//   //       );
//   //     }
//   //   }

//   //   // Sort users if requested
//   //   let sortedUsers = [...users];
//   //   if (sortByRating) {
//   //     sortedUsers.sort((a, b) => {
//   //       const ratingA = a.averageRating || 0;
//   //       const ratingB = b.averageRating || 0;
//   //       return sortByRating === "desc" ? ratingB - ratingA : ratingA - ratingB;
//   //     });
//   //   }

//   //   return res.status(200).json({
//   //     success: true,
//   //     message:
//   //       users.length > 0
//   //         ? "Users fetched successfully"
//   //         : "No users found for the given criteria",
//   //     users: sortedUsers,
//   //     meta: {
//   //       total: sortedUsers.length,
//   //       filter: filter,
//   //       category,
//   //       city,
//   //     },
//   //   });
//   // } catch (error) {
//   //   console.error("[ERROR] Failed to fetch users:", error);
//   //   return res.status(500).json({
//   //     success: false,
//   //     message: "Failed to fetch users",
//   //     error: error.message,
//   //   });
//   // }
// };

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
      userstatus: "available",
      isAdminApproved: true,
    }).select(
      "_id name email phone businessCategory profilePic ratings businessName businessAddress averageRating"
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

module.exports = {
  getUsersByBCategory,
};
