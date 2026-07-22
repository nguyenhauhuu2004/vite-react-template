import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    resourceType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
  },
  {
    _id: false,
  },
);

const scheduleSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    spotsLeft: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const workshopSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
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

    highlights: {
      type: [String],
      default: [],
    },

    includes: {
      type: [String],
      default: [],
    },

    thumbnail: {
      type: mediaSchema,
      required: true,
    },

    gallery: {
      type: [mediaSchema],
      default: [],
    },

    video: {
      type: mediaSchema,
      default: null,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    duration: {
      type: String,
      required: true,
    },

    seatsTotal: {
      type: Number,
      required: true,
      min: 1,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      default: "Beginner",
    },

    schedules: {
      type: [scheduleSchema],
      default: [],
    },

    location: {
      address: {
        type: String,
        required: true,
      },

      placeId: {
        type: String,
        default: "",
      },

      notes: {
        type: String,
        default: "",
      },

      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },

        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  {
    timestamps: true,
  },
);

workshopSchema.index({
  "location.coordinates": "2dsphere",
});

const Workshop = mongoose.model("Workshop", workshopSchema);

export default Workshop;
