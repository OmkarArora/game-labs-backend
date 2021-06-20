const mongoose = require("mongoose");
require('mongoose-type-url');

const VideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: "Cannot create a playlist without a `name`"
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    thumbnail: {
      type: mongoose.SchemaTypes.Url,
      required: "Video needs a thumbnail image url"
    },
    video: {
      type: mongoose.SchemaTypes.Url,
      required: "Video needs a url"
    },
    description: {
      type: String
    },
    runtime: {
      minutes: {
        type: Number,
        required: "Video runtime - minutes required"
      },
      seconds: {
        type: Number,
        required: "Video runtime - seconds required"
      }
    }
  },
  {
    timestamps: true
  }
);

const Video = mongoose.model("Video", VideoSchema);

module.exports = { Video };