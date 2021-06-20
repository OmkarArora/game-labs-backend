const mongoose = require("mongoose");
require('mongoose-type-url');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "Cannot create a category without a `name` field"
    },
    developers: [
      {
        type: String,
        required: "Provide atleat one developer, expected an array"
      }
    ],
    publishers: [
      {
        type: String,
        required: "Provide atleat one publisher, expected an array"
      }
    ],
    release: {
      type: Date
    },
    genre: [
      {type: String}
    ],
    thumbnail: {
      type: mongoose.SchemaTypes.Url,
      required: "Category needs a thumbnail image"
    },
    icon: {
      type: mongoose.SchemaTypes.Url,
      required: "Category needs an icon"
    },
    gallery: [
      {type: mongoose.SchemaTypes.Url}
    ],
    description: {
      type: String,
      minLength: [100, "Description should be atleast 100 characters long"]
    },
    platforms: [
      {
        type: String,
        enum: ["PS4", "PS5", "Xbox One | X", "Xbox Series X | S", "Windows 10", "macOS", "iOS", "Android", "Nintendo Switch"],
      }
    ]
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model("Category", CategorySchema);

module.exports = { Category };