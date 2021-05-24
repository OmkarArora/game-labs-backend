const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { extend } = require("lodash");
const { paramLogger } = require("../middleware/middleware");

const { User } = require("../models/user.model");
const { Playlist } = require("../models/playlist.model");
const { Category } = require("../models/category.model");

let userCategorySubscriptionsRouter = express.Router({ mergeParams: true });
router.use("/:userId/category-subscriptions", userCategorySubscriptionsRouter);

let userPlaylistsRouter = express.Router({ mergeParams: true });
router.use("/:userId/playlists", userPlaylistsRouter);

router.use("/:userId", paramLogger);

router
  .route("/")
  .get(async (req, res) => {
    res.status(403).json({ success: false, message: "Not accessible" });
    // TODO: user details shouldnt be accessible
    try {
      const users = await User.find({});
      res.json({ success: true, users });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Unable to get users",
          errorMessage: error.message,
        });
    }
  })
  .post(async (req, res) => {
    try {
      const user = req.body;
      if (!(user.email && user.password && user.name)) {
        return res
          .status(400)
          .json({ success: false, message: "Data not formatted properly" });
      }
      const NewUser = new User(user);

      const salt = await bcrypt.genSalt(10);

      NewUser.password = await bcrypt.hash(NewUser.password, salt);

      const savedUser = await NewUser.save();

      res.json({
        success: true,
        user: {
          id: savedUser._id,
          email: savedUser.email,
          role: savedUser.role,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Unable to register user",
          errorMessage: error.message,
        });
    }
  });

router.param("userId", async (req, res, next, userId) => {
  try {
    const user = await User.findById(userId);
    console.log("User ID: ", userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Error getting user" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Error while retreiving the user" });
  }
});

router
  .route("/:userId")
  .get(async (req, res) => {
    console.log("Params Checked", req.paramsChecked);
    const { user } = req;
    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        id: user._id,
      },
    });
  })
  .post(async (req, res) => {
    const userUpdates = req.body;
    let { user } = req;
    user = extend(user, userUpdates);
    user = await user.save();
    // if made undefined, the property does not get passed into the json
    user.__v = undefined;
    res.json({ success: true, user });
  })
  .delete(async (req, res) => {
    let { user } = req;
    user = await user.remove();
    res.json({
      success: true,
      message: "User deleted successfully",
      user,
      deleted: true,
    });
  });

userPlaylistsRouter
  .route("/")
  .get((req, res) => {
    const { userId } = req.params;
    User.findById(userId)
      .populate({
        path: "playlists",
        select: { _id: 1, title: 1, videos: 1 },
        populate: {
          path: "videos",
          select: {
            _id: 1,
            title: 1,
            category: 1,
            thumbnail: 1,
            video: 1,
            description: 1,
            runtime: 1,
          },
        },
      })
      .exec((error, user) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({
              success: false,
              message: "Error while retreiving playlists",
              errorMessage: error.message,
            });
        }
        return res.json({ success: true, playlists: user.playlists });
      });
  })
  .post(async (req, res) => {
    const playlistUpdates = req.body;
    let { user } = req;
    let newdata = extend(user.playlists, playlistUpdates);
    console.log(newdata);
  });

userPlaylistsRouter.route("/create").post(async (req, res) => {
  try {
    // expected to send `title`
    const playlist = req.body;
    let { user } = req;
    const NewPlaylist = new Playlist(playlist);
    const savedPlaylist = await NewPlaylist.save();
    user.playlists.push(savedPlaylist);
    await user.save();
    res.json({ success: true, playlist: savedPlaylist });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Unable to create playlist",
        errorMessage: error.message,
      });
  }
});

userPlaylistsRouter.route("/delete").post(async (req, res) => {
  try {
    let { user } = req;
    const { playlistId } = req.body;
    user.playlists = user.playlists.filter((item) => item.id !== playlistId);
    user = await user.save();
    let playlist = await Playlist.findById(playlistId);
    playlist = await playlist.remove();
    res.json({
      success: true,
      message: `Playlist ${playlist.title} deleted`,
      playlist,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "error while deleting playlist",
        errorMessage: error.message,
      });
  }
});

userCategorySubscriptionsRouter.route("/").get(async (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .populate("categorySubscriptions")
    .exec((error, user) => {
      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({
            success: false,
            message: "Error while retreiving user catgories",
            errorMessage: error.message,
          });
      }
      return res.json({
        success: true,
        categorySubscriptions: user.categorySubscriptions,
      });
    });
});

userCategorySubscriptionsRouter.route("/sub").post(async (req, res) => {
  try {
    // expected to get category id
    const { categoryId } = req.body;
    let { user } = req;
    if (user.categorySubscriptions.find((item) => String(item) === categoryId))
      return res.json({ success: true, message: "User already subbed" });
    user.categorySubscriptions.push(categoryId);
    await user.save();
    let category = await Category.findById(categoryId);
    res.json({
      success: true,
      message: `User subbed to ${category.name}`,
      category,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error occurred while subscribing",
        errorMessage: error.message,
      });
  }
});

userCategorySubscriptionsRouter.route("/unsub").post(async (req, res) => {
  try {
    let { user } = req;
    const { categoryId } = req.body;
    user.categorySubscriptions = user.categorySubscriptions.filter(
      (item) => String(item) !== categoryId
    );
    user = await user.save();
    let category = await Category.findById(categoryId);
    res.json({
      success: true,
      message: `User unsubbed from ${category.name}`,
      category,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "error while unsubbing",
        errorMessage: error.message,
      });
  }
});

module.exports = router;
