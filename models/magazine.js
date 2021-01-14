const mongoose = require("mongoose");

const slugify = require("slugify");
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
    slug: {
      type: String,
      required: true,
      unique: true,
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
    status: {
      type: String,
      required: true,
      enum: ["public", "private"],
    },
  },
  { timestamps: true }
);

magazineSchema.pre("validate", function (next) {
  this.issue
    ? (this.slug = slugify(this.issue, { lower: true, strict: true }))
    : console.log("title is not defined");
  next();
});

const Magazine = mongoose.model("magazine", magazineSchema);

module.exports = Magazine;
