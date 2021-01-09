const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      required: true,
      type: String,
      trim: true,
    },
    snippet: {
      required: true,
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    body: {
      type: String,
      required: true,
    },
    sanitizedHtml: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    privateStatus: {
      type: Boolean,
      default: true,
    },
    blogPostCI: [
      {
        url: String,
        publicId: String,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    guestAuthor: {
      type: String,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const BlogPost = mongoose.model("blogpost", blogPostSchema);

module.exports = BlogPost;
