
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // =====================================================
    // LIVE EVENT
    // =====================================================

    status: {
      type: String,
      enum: [
        "upcoming",
        "live",
        "completed",
        "cancelled",
      ],
      default: "upcoming",
    },

    liveStartedAt: {
      type: Date,
      default: null,
    },

    liveEndedAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // POSTER SETTINGS
    // =====================================================

    posterTemplate: {
      type: String,
      default: "editorial",
    },

    posterTheme: {
      type: String,
      default: "peach",
    },

    posterLayout: {
      type: String,
      default: "classic",
    },

    posterFont: {
      type: String,
      default: "modern",
    },

    posterTitle: {
      type: String,
      default: "",
    },

    posterSubtitle: {
      type: String,
      default: "",
    },

    posterDescription: {
      type: String,
      default: "",
    },

    posterTextAlign: {
      type: String,
      default: "left",
    },

    posterFilter: {
      type: String,
      default: "none",
    },

    posterBadge: {
      type: String,
      default: "EVENTHUB",
    },

    accentColor: {
      type: String,
      default: "#713528",
    },

    posterBackgroundColor: {
      type: String,
      default: "#FFFDFB",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Event",
  eventSchema
);

