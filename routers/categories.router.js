const express = require("express");
const router = express.Router();
const { extend } = require("lodash");
const { paramLogger } = require("../middleware/middleware");

const { Category } = require("../models/category.model");

router.use("/:categoryId", paramLogger);

router.route("/")
  .get(async (req, res) => {
    try {
      const categories = await Category.find({});
      res.json({ success: true, categories })
    } catch (error) {
      res.status(500).json({ success: false, message: "Unable to get categories", errorMessage: error.message });
    }
  }).post(async (req, res) => {
    try {
      const category = req.body;
      const NewCategory = new Category(category);
      const savedCategory = await NewCategory.save();
      res.json({ success: true, category: savedCategory });
    }
    catch (error) {
      res.status(500).json({ success: false, message: "Unable to create category", errorMessage: error.message });
    }
  })

router.param("categoryId", async (req, res, next, categoryId) => {
  try {
    console.log("Category ID: ", categoryId);
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ success: false, message: "Error getting category" });
    }
    req.category = category;
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: "Error while retreiving the category" });
  }
})

router.route("/:categoryId")
  .get(async (req, res) => {
    try {
      console.log("Params Checked", req.paramsChecked);
      const { category } = req;
      category._v = undefined;
      res.json({ success: true, category });
    } catch (error) {
      return res.status(400).json({ success: false, message: "Error while retreiving category", errorMessage: error.message });
    }
  })
  .post(async (req, res) => {
    try {
      const videoUpdates = req.body;
      let { category } = req;
      category = extend(category, videoUpdates);
      category = await category.save();
      category.__v = undefined;
      res.json({ success: true, category });
    }
    catch (error) {
      return res.status(400).json({ success: false, message: "Error while updating category", errorMessage: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      let { category } = req;
      category = await category.remove();
      res.json({ success: true, message: "Category deleted successfully", category, deleted: true })
    } catch (error) {
      return res.status(400).json({ success: false, message: "Error while deleting category", errorMessage: error.message });
    }
  })


module.exports = router;