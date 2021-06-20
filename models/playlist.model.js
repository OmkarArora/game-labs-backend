const mongoose = require("mongoose");

const PlaylistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: "Cannot create a playlist without a `title`"
    },
    videos: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true
    }]
  },
  {
    timestamps: true
  }
);

const Playlist = mongoose.model("Playlist", PlaylistSchema);

module.exports = { Playlist };