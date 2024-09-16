const express = require("express");
const router = express.Router();
const { authVerify } = require("../middleware/middleware");
const { Playlist } = require("../models/playlist.model");
const { User } = require("../models/user.model");

router.use(authVerify);

router.route("/history/add").post(async (req, res) => {
  try {
    // Add video to history
    const { video } = req.body;
    let { userId } = req.userAuth;
    let user = await User.findById(userId).populate("history");
    let playlist = user.history
      ? user.history
      : new Playlist({ title: "History", videos: [] });
    if (playlist.videos.find((item) => String(item) === video)) {
      return res.json({
        success: "true",
        message: "Video already added to playlist",
      });
    }
    playlist.videos.push(video);
    await playlist.save();
    if (!user.history) {
      user.history = playlist;
      user = await user.save();
    }
    Playlist.findById(playlist._id)
      .populate("videos")
      .exec((error, playlist) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            success: false,
            message: "Error while retreiving watch history",
            errorMessage: error.message,
          });
        }
        return res.json({ success: true, history: playlist });
      });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error while adding video to playlist",
      errorMessage: error.message,
    });
  }
});

router.route("/history/delete").post(async (req, res) => {
  try {
    // delete a video from playlist
    const { video } = req.body;
    let { userId } = req.userAuth;
    let user = await User.findById(userId).populate("history");
    let playlist = user.history;
    playlist.videos = playlist.videos.filter((item) => String(item) !== video);
    playlist = await playlist.save();
    Playlist.findById(playlist._id)
      .populate("videos")
      .exec((error, playlist) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            success: false,
            message: "Error while retreiving history",
            errorMessage: error.message,
          });
        }
        return res.json({ success: true, history: playlist });
      });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error while deleting the video from history",
      errorMessage: error.message,
    });
  }
});

router.route("/watch-later/add").post(async (req, res) => {
  try {
    // Add video to history
    const { video } = req.body;
    let { userId } = req.userAuth;
    let user = await User.findById(userId).populate("watchLater");
    let playlist = user.watchLater
      ? user.watchLater
      : new Playlist({ title: "Watch Later", videos: [] });
    if (playlist.videos.find((item) => String(item) === video)) {
      return res.json({
        success: "true",
        message: "Video already added to playlist",
      });
    }
    playlist.videos.push(video);
    await playlist.save();
    if (!user.watchLater) {
      user.watchLater = playlist;
      user = await user.save();
    }
    Playlist.findById(playlist._id)
      .populate("videos")
      .exec((error, playlist) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            success: false,
            message: "Error while retreiving watch later playlist",
            errorMessage: error.message,
          });
        }
        return res.json({ success: true, history: playlist });
      });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error while adding video to watch later playlist",
      errorMessage: error.message,
    });
  }
});

router.route("/watch-later/delete").post(async (req, res) => {
  try {
    // delete a video from playlist
    const { video } = req.body;
    let { userId } = req.userAuth;
    let user = await User.findById(userId).populate("watchLater");
    let playlist = user.watchLater;
    playlist.videos = playlist.videos.filter((item) => String(item) !== video);
    playlist = await playlist.save();
    Playlist.findById(playlist._id)
      .populate("videos")
      .exec((error, playlist) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            success: false,
            message: "Error while retreiving watch later playlist",
            errorMessage: error.message,
          });
        }
        return res.json({ success: true, history: playlist });
      });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error while deleting the video from watch history",
      errorMessage: error.message,
    });
  }
});

module.exports = router;
