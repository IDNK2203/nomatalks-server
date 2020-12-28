const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const magazineSchema = new Schema(
  {
    issue: {
      type: String,
      required: true,
    },
    coverImage: [
      {
        url: String,
        publicId: String,
      },
    ],
    snippet: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    magazineUrl: {
      type: String,
      required: true,
    },
    magazineTitle: {
      type: String,
      required: true,
    },
    privateStatus: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Magazine = mongoose.model("magazine", magazineSchema);

module.exports = Magazine;
