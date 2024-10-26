const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
  },
  description: {
    type: String,
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  subCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  // common field
  status: {
    // true or false
    type: Boolean,
    default: true,
  },
  existence: {
    // true and false
    type: Boolean,
    default: true,
  },
  createdBy: {
    // @relation
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    // @relation
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Category", schema);
