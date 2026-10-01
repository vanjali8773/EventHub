
const express = require("express");
const Notification = require("../models/Notification");

const router = express.Router();

// =====================================================
// GET USER NOTIFICATIONS
// =====================================================

router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.params.userId,
    })
      .populate("sender", "username email")
      .populate("event", "title date location")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Notifications load error:", error);

    res.status(500).json({
      message: "Notifications load nahi hui.",
    });
  }
});

// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================

router.put("/:id/read", async (req, res) => {
  try {
    const notification =
      await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    notification.read = true;

    await notification.save();

    res.json({
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error(
      "Notification read error:",
      error
    );

    res.status(500).json({
      message: "Notification update nahi hui.",
    });
  }
});

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

router.put("/:userId/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.params.userId,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    res.json({
      message:
        "All notifications marked as read.",
    });
  } catch (error) {
    console.error(
      "Mark all notifications error:",
      error
    );

    res.status(500).json({
      message:
        "Notifications update nahi hui.",
    });
  }
});

// =====================================================
// DELETE NOTIFICATION
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const notification =
      await Notification.findByIdAndDelete(
        req.params.id
      );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    res.json({
      message: "Notification deleted.",
    });
  } catch (error) {
    console.error(
      "Notification delete error:",
      error
    );

    res.status(500).json({
      message: "Notification delete nahi hui.",
    });
  }
});

module.exports = router;

