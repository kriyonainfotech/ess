const UserModel = require("../model/user");

// Backend route (e.g., in Express.js)
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
//     filter.userstatus = status; // Filter by user status (e.g., "available", "unavailable")
//   }

//   if (isAdminApproved !== undefined) {
//     filter.isAdminApproved = isAdminApproved; // Filter by admin approval status
//   }

//   try {
//     // Debug: Log the filter object
//     console.log("Filter object:", filter);

//     // Fetch users based on the filter
//     let users = await UserModel.find(filter);
//     let userc = await UserModel.find({ businessCategory: category });
//     // Debug: Log the fetched users
//     console.log("Fetched users:", users, userc);

//     // Sort by averageRating if requested
//     if (sortByRating === "desc") {
//       users.sort((a, b) => b.averageRating - a.averageRating); // Descending order
//     } else if (sortByRating === "asc") {
//       users.sort((a, b) => a.averageRating - b.averageRating); // Ascending order
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

const getUsersByBCategory = async (req, res) => {
  const { category, city, status, isAdminApproved, sortByRating } = req.body;

  console.log("Received category:", category); // Debug: Log the received category
  console.log("Received city:", city); // Debug: Log the received city

  const filter = {};

  if (category) {
    filter.businessCategory = { $in: [category] }; // Exact match for category
  }

  if (city) {
    filter["address.city"] = city; // Exact match for city
  }

  if (status) {
    filter.userstatus = status; // Filter by user status
  }

  if (isAdminApproved !== undefined) {
    filter.isAdminApproved = isAdminApproved; // Filter by admin approval status
  }

  try {
    console.log("Filter object:", filter);

    // Fetch only the required fields
    // let users = await UserModel.find(filter);
    let users = await UserModel.find(filter).select(
      "name phone address businessCategory profilePic userstatus ratings averageRating"
    );

    console.log("Fetched users:", users);

    // Sort by averageRating if requested
    if (sortByRating === "desc") {
      users.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortByRating === "asc") {
      users.sort((a, b) => a.averageRating - b.averageRating);
    }

    res.status(200).send({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.log("Error fetching filtered users:", error);
    res
      .status(500)
      .send({ success: false, message: "Internal server error", error });
  }
};

module.exports = {
  getUsersByBCategory,
};
