const express = require("express");
const Remark = require("../model/remark");

const router = express.Router();

// Create or update remarks
router.post("/save", async (req, res) => {
  try {
    const { userId, remarks } = req.body;
    if (!userId || !remarks) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let remarkDoc = await Remark.findOne({ userId });

    if (remarkDoc) {
      remarkDoc.remarks = remarks;
      await remarkDoc.save();
    } else {
      remarkDoc = new Remark({ userId, remarks });
      await remarkDoc.save();
    }

    res.status(200).json({ message: "Remarks saved successfully", remarkDoc });
  } catch (error) {
    console.error("Error saving remarks:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch user remarks
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const remarkDoc = await Remark.findOne({ userId });

    if (!remarkDoc) {
      return res.status(404).json({ message: "No remarks found" });
    }

    res.status(200).json({ remarks: remarkDoc.remarks });
  } catch (error) {
    console.error("Error fetching remarks:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
