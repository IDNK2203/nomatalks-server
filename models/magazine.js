const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const magazineSchema = new Schema(
  {
    issue: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    sinppet: {
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
  },
  { timestamps: true }
);

const Magazine = mongoose.model("magazine", magazineSchema);

module.exports = Magazine;
