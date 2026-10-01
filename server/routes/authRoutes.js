
const bcrypt = require("bcryptjs");
const express = require("express");
const User = require("../models/User");

const router = express.Router();

// =====================================================
// REGISTER
// =====================================================

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto || "",
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto || "",
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// =====================================================
// GET PROFILE
// =====================================================

router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate("savedEvents");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto || "",
      savedEvents: user.savedEvents || [],
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Profile load nahi hui.",
    });
  }
});

// =====================================================
// UPDATE PROFILE
// =====================================================

router.put("/profile/:userId", async (req, res) => {
  try {
    const { username, email, profilePhoto } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        message: "Username and email are required.",
      });
    }

    const currentUser = await User.findById(req.params.userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Check username already used by another user
    const usernameExists = await User.findOne({
      username: username.trim(),
      _id: { $ne: req.params.userId },
    });

    if (usernameExists) {
      return res.status(400).json({
        message: "Username already exists.",
      });
    }

    // Check email already used by another user
    const emailExists = await User.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: req.params.userId },
    });

    if (emailExists) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    currentUser.username = username.trim();
    currentUser.email = email.trim().toLowerCase();

    if (typeof profilePhoto === "string") {
      currentUser.profilePhoto = profilePhoto.trim();
    }

    await currentUser.save();

    res.json({
      message: "Profile updated successfully.",
      user: {
        id: currentUser._id,
        username: currentUser.username,
        email: currentUser.email,
        profilePhoto: currentUser.profilePhoto || "",
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Profile update nahi hui.",
    });
  }
});

module.exports = router;

