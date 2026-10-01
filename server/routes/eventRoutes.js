
const express = require("express");
const Event = require("../models/Event");
const User = require("../models/User");
const Notification = require("../models/Notification");

const router = express.Router();

// =====================================================
// CREATE EVENT
// =====================================================

router.post("/", async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      status: "upcoming",
      liveStartedAt: null,
      liveEndedAt: null,
    });

    await event.save();

    res.status(201).json({
      message: "Event created successfully.",
      event,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Event create nahi hua.",
    });
  }
});

// =====================================================
// GET ALL EVENTS
// =====================================================

router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "username email phone")
      .populate("attendees", "username email")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Events load nahi hue.",
    });
  }
});

// =====================================================
// GET SAVED EVENTS
// IMPORTANT: BEFORE /:id
// =====================================================

router.get("/saved/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate({
      path: "savedEvents",
      populate: [
        {
          path: "createdBy",
          select: "username email phone",
        },
        {
          path: "attendees",
          select: "username email",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.json(user.savedEvents || []);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Saved events load nahi hue.",
    });
  }
});

// =====================================================
// SAVE EVENT
// =====================================================

router.post("/:id/save", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User information required.",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const alreadySaved = user.savedEvents.some(
      (savedEvent) =>
        String(savedEvent) === String(event._id)
    );

    if (alreadySaved) {
      return res.status(400).json({
        message: "Event already saved.",
      });
    }

    user.savedEvents.push(event._id);

    await user.save();

    res.json({
      message: "Event saved successfully.",
      saved: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Event save nahi hua.",
    });
  }
});

// =====================================================
// UNSAVE EVENT
// =====================================================

router.post("/:id/unsave", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User information required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.savedEvents = user.savedEvents.filter(
      (savedEvent) =>
        String(savedEvent) !== String(req.params.id)
    );

    await user.save();

    res.json({
      message: "Event removed from saved events.",
      saved: false,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Event unsave nahi hua.",
    });
  }
});

// =====================================================
// START LIVE EVENT
// =====================================================

router.post("/:id/start-live", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User information required.",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    // Only organizer can start the event
    if (
      String(event.createdBy) !==
      String(userId)
    ) {
      return res.status(403).json({
        message:
          "Only the event organizer can start the live event.",
      });
    }

    // Already live
    if (event.status === "live") {
      return res.status(400).json({
        message: "Event is already live.",
        event,
      });
    }

    // Completed event cannot become live again
    if (event.status === "completed") {
      return res.status(400).json({
        message:
          "A completed event cannot be started again.",
      });
    }

    // Cancelled event cannot become live
    if (event.status === "cancelled") {
      return res.status(400).json({
        message:
          "A cancelled event cannot be started.",
      });
    }

    event.status = "live";
    event.liveStartedAt = new Date();
    event.liveEndedAt = null;

    await event.save();

    // Notify attendees
    if (
      event.attendees &&
      event.attendees.length > 0
    ) {
      const notifications = event.attendees.map(
        (attendee) => ({
          recipient: attendee,
          sender: userId,
          event: event._id,
          type: "event_update",
          message: `"${event.title}" is now LIVE! Join the event now.`,
        })
      );

      await Notification.insertMany(
        notifications
      );
    }

    const updatedEvent =
      await Event.findById(event._id)
        .populate(
          "createdBy",
          "username email phone"
        )
        .populate(
          "attendees",
          "username email"
        );

    res.json({
      message: "Event is now LIVE.",
      event: updatedEvent,
    });
  } catch (error) {
    console.error(
      "Start live event error:",
      error
    );

    res.status(500).json({
      message:
        "Live event start nahi hua.",
    });
  }
});

// =====================================================
// END LIVE EVENT
// =====================================================

router.post("/:id/end-live", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User information required.",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    // Only organizer can end the event
    if (
      String(event.createdBy) !==
      String(userId)
    ) {
      return res.status(403).json({
        message:
          "Only the event organizer can end the live event.",
      });
    }

    if (event.status !== "live") {
      return res.status(400).json({
        message: "Event is not currently live.",
      });
    }

    event.status = "completed";
    event.liveEndedAt = new Date();

    await event.save();

    // Notify attendees
    if (
      event.attendees &&
      event.attendees.length > 0
    ) {
      const notifications = event.attendees.map(
        (attendee) => ({
          recipient: attendee,
          sender: userId,
          event: event._id,
          type: "event_update",
          message: `"${event.title}" has ended. Thank you for attending!`,
        })
      );

      await Notification.insertMany(
        notifications
      );
    }

    const updatedEvent =
      await Event.findById(event._id)
        .populate(
          "createdBy",
          "username email phone"
        )
        .populate(
          "attendees",
          "username email"
        );

    res.json({
      message: "Live event ended.",
      event: updatedEvent,
    });
  } catch (error) {
    console.error(
      "End live event error:",
      error
    );

    res.status(500).json({
      message:
        "Live event end nahi hua.",
    });
  }
});

// =====================================================
// GET SINGLE EVENT
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate(
        "createdBy",
        "username email phone"
      )
      .populate(
        "attendees",
        "username email"
      );

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    res.json(event);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Event load nahi hua.",
    });
  }
});

// =====================================================
// JOIN EVENT
// =====================================================

router.post("/:id/join", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User information required.",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    // Cancelled event cannot be joined
    if (event.status === "cancelled") {
      return res.status(400).json({
        message:
          "This event has been cancelled.",
      });
    }

    // Organizer cannot join own event
    if (
      String(event.createdBy) ===
      String(userId)
    ) {
      return res.status(400).json({
        message:
          "Event organizer cannot join their own event.",
      });
    }

    if (!event.attendees) {
      event.attendees = [];
    }

    const alreadyJoined =
      event.attendees.some(
        (attendee) =>
          String(attendee) === String(userId)
      );

    if (alreadyJoined) {
      return res.status(400).json({
        message:
          "You have already joined this event.",
      });
    }

    event.attendees.push(userId);

    await event.save();

    // =================================================
    // CREATE JOIN NOTIFICATION
    // =================================================

    const joiningUser =
      await User.findById(userId);

    if (joiningUser) {
      await Notification.create({
        recipient: event.createdBy,
        sender: userId,
        event: event._id,
        type: "event_join",
        message: `${joiningUser.username} joined your event "${event.title}".`,
      });
    }

    const updatedEvent =
      await Event.findById(event._id)
        .populate(
          "createdBy",
          "username email phone"
        )
        .populate(
          "attendees",
          "username email"
        );

    res.json({
      message: "Event joined successfully.",
      event: updatedEvent,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Event join nahi hua.",
    });
  }
});

// =====================================================
// LEAVE EVENT
// =====================================================

router.post("/:id/leave", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User information required.",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    if (!event.attendees) {
      event.attendees = [];
    }

    const joinedIndex =
      event.attendees.findIndex(
        (attendee) =>
          String(attendee) === String(userId)
      );

    if (joinedIndex === -1) {
      return res.status(400).json({
        message:
          "You have not joined this event.",
      });
    }

    event.attendees.splice(
      joinedIndex,
      1
    );

    await event.save();

    // =================================================
    // CREATE LEAVE NOTIFICATION
    // =================================================

    const leavingUser =
      await User.findById(userId);

    if (leavingUser) {
      await Notification.create({
        recipient: event.createdBy,
        sender: userId,
        event: event._id,
        type: "event_leave",
        message: `${leavingUser.username} left your event "${event.title}".`,
      });
    }

    const updatedEvent =
      await Event.findById(event._id)
        .populate(
          "createdBy",
          "username email phone"
        )
        .populate(
          "attendees",
          "username email"
        );

    res.json({
      message: "You left the event.",
      event: updatedEvent,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Event leave nahi hua.",
    });
  }
});

// =====================================================
// UPDATE EVENT
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const {
      createdBy,
      status,
      liveStartedAt,
      liveEndedAt,
      ...updates
    } = req.body;

    if (!createdBy) {
      return res.status(400).json({
        message:
          "Creator information required.",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    if (
      String(event.createdBy) !==
      String(createdBy)
    ) {
      return res.status(403).json({
        message:
          "You can only edit your own event.",
      });
    }

    // Prevent normal edit API from changing
    // live status directly.
    Object.assign(event, updates);

    await event.save();

    // =================================================
    // NOTIFY ATTENDEES
    // =================================================

    if (
      event.attendees &&
      event.attendees.length > 0
    ) {
      const notifications =
        event.attendees
          .filter(
            (attendee) =>
              String(attendee) !==
              String(createdBy)
          )
          .map((attendee) => ({
            recipient: attendee,
            sender: createdBy,
            event: event._id,
            type: "event_update",
            message: `The event "${event.title}" has been updated.`,
          }));

      if (notifications.length > 0) {
        await Notification.insertMany(
          notifications
        );
      }
    }

    const updatedEvent =
      await Event.findById(event._id)
        .populate(
          "createdBy",
          "username email phone"
        )
        .populate(
          "attendees",
          "username email"
        );

    res.json({
      message:
        "Event updated successfully.",
      event: updatedEvent,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Event update nahi hua.",
    });
  }
});

// =====================================================
// DELETE EVENT
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const { createdBy } = req.body;

    if (!createdBy) {
      return res.status(400).json({
        message:
          "Creator information required.",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found.",
      });
    }

    if (
      String(event.createdBy) !==
      String(createdBy)
    ) {
      return res.status(403).json({
        message:
          "You can only delete your own event.",
      });
    }

    await Event.findByIdAndDelete(
      req.params.id
    );

    // Remove deleted event from saved lists
    await User.updateMany(
      {
        savedEvents: req.params.id,
      },
      {
        $pull: {
          savedEvents: req.params.id,
        },
      }
    );

    // Remove related notifications
    await Notification.deleteMany({
      event: req.params.id,
    });

    res.json({
      message:
        "Event deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Event delete nahi hua.",
    });
  }
});

module.exports = router;

