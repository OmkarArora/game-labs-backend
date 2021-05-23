const express = require("express");
const router = express.Router();
const { extend } = require("lodash");
const { paramLogger } = require("../middleware/middleware");

const { Playlist } = require("../models/playlist.model");

let playlistVideoRouter = express.Router({ mergeParams: true });
router.use("/:playlistId/video", playlistVideoRouter)

router.use("/:playlistId", paramLogger);

router.route("/")
  .get(async (req, res) => {
    try {
      const playlists = await Playlist.find({});
      res.json({ success: true, playlists })
    } catch (error) {
      res.status(500).json({ success: false, message: "Unable to get playlists", errorMessage: error.message });
    }
  }).post(async (req, res) => {
    try {
      const playlist = req.body;
      const NewPlaylist = new User(playlist);
      const savedPlaylist = await NewPlaylist.save();
      res.json({ success: true, playlist: savedPlaylist });
    }
    catch (error) {
      res.status(500).json({ success: false, message: "Unable to create playlist", errorMessage: error.message });
    }
  })

router.param("playlistId", async (req, res, next, playlistId) => {
  try {
    console.log("Playlist ID: ", playlistId);
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(400).json({ success: false, message: "Error getting playlist" });
    }
    req.playlist = playlist;
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: "Error while retreiving the playlist" });
  }
})

router.route("/:playlistId")
  .get(async (req, res) => {
    try {
      console.log("Params Checked", req.paramsChecked);
      const { playlist } = req;
      playlist._v = undefined;
      res.json({ success: true, playlist });
    } catch (error) {
      return res.status(400).json({ success: false, message: "Error while retreiving playlist", errorMessage: error.message });
    }
  })
  .post(async (req, res) => {
    try {
      const playlistUpdates = req.body;
      let { playlist } = req;
      playlist = extend(playlist, playlistUpdates);
      playlist = await playlist.save();
      playlist.__v = undefined;
      res.json({ success: true, playlist });
    }
    catch (error) {
      return res.status(400).json({ success: false, message: "Error while updating playlist", errorMessage: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      let { playlist } = req;
      playlist = await playlist.remove();
      res.json({ success: true, message: "Playlist deleted successfully", playlist, deleted: true })
    } catch (error) {
      return res.status(400).json({ success: false, message: "Error while deleting playlist", errorMessage: error.message });
    }
  })

playlistVideoRouter.route("/add")
  .post(async (req, res) => {
    try {
      // Add video to playlist
      const { video } = req.body;
      let { playlist } = req;
      if (playlist.videos.find(item => String(item) === video)) {
        return res.json({ success: "true", message: "Video already added to playlist" });
      }
      playlist.videos.push(video);
      console.log(playlist)
      playlist = await playlist.save();
      Playlist.findById(playlist._id).populate("videos").exec((error, playlist) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ success: false, message: "Error while retreiving playlists", errorMessage: error.message });
        }
        return res.json({ success: true, playlist })
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: "Error while adding video to playlist", errorMessage: error.message });
    }
  })

playlistVideoRouter.route("/delete")
  .post(async (req, res) => {
    try {
      // delete a video from playlist
      const { video } = req.body;
      let { playlist } = req;
      playlist.videos = playlist.videos.filter(item => String(item) !== video);
      playlist = await playlist.save();
      Playlist.findById(playlist._id).populate("videos").exec((error, playlist) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ success: false, message: "Error while retreiving playlists", errorMessage: error.message });
        }
        return res.json({ success: true, playlist })
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: "Error while deleting the video from playlist", errorMessage: error.message });
    }
  })

module.exports = router;