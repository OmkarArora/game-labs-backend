const express = require("express");
const router = express.Router();
const { extend } = require("lodash");
const { paramLogger } = require("../middleware/middleware");

const { Video } = require("../models/video.model");

router.use("/:videoId", paramLogger);

router.route("/")
  .get(async (req, res) => {
    try {
      const videos = await Video.find({});
      res.json({ success: true, videos })
    } catch (error) {
      res.status(500).json({ success: false, message: "Unable to get videos", errorMessage: error.message });
    }
  }).post(async (req, res) => {
    try {
      const video = req.body;
      const NewVideo = new Video(video);
      const savedVideo = await NewVideo.save();
      res.json({ success: true, video: savedVideo });
    }
    catch (error) {
      res.status(500).json({ success: false, message: "Unable to create video", errorMessage: error.message });
    }
  })

router.param("videoId", async (req, res, next, videoId) => {
  try {
    const video = await Video.findById(videoId);
    console.log("Video ID: ", videoId);
    if (!video) {
      return res.status(400).json({ success: false, message: "Error getting video" });
    }
    req.video = video;
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: "Error while retreiving the video" });
  }
})

router.route("/:videoId")
  .get(async (req, res) => {
    try {
      console.log("Params Checked", req.paramsChecked);
      const { video } = req;
      video.__v = undefined;
      res.json({ success: true, video });
    } catch (error) {
      return res.status(400).json({ success: false, message: "Error while retreiving video", errorMessage: error.message });
    }
  })
  .post(async (req, res) => {
    try {
      const videoUpdates = req.body;
      let { video } = req;
      video = extend(video, videoUpdates);
      video = await video.save();
      video.__v = undefined;
      res.json({ success: true, video });
    }
    catch (error) {
      return res.status(400).json({ success: false, message: "Error while updating video", errorMessage: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      let { video } = req;
      video = await video.remove();
      res.json({ success: true, message: "Video deleted successfully", video, deleted: true })
    } catch (error) {
      return res.status(400).json({ success: false, message: "Error while deleting video", errorMessage: error.message });
    }
  })


module.exports = router;