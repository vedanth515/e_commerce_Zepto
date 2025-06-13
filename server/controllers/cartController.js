


// controllers/cartController.js

import User from "../models/User.js";

export const updateCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const userId = req.id; // ✅ coming from auth middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID" });
    }

    await User.findByIdAndUpdate(userId, { cartItems });

    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.error("UpdateCart Error:", error); // 👈 log full error
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};




