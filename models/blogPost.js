const mongoose = require("mongoose");

const slugify = require("slugify");
const createDOMPurify = require("dompurify");
const wordCount = require("html-word-count");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

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
    blogBody: {
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
    },
    status: {
      type: String,
      required: true,
      enum: ["public", "private"],
    },
    blogPostCI: [
      {
        url: String,
        publicId: String,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
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

blogPostSchema.pre("validate", function (next) {
  this.title
    ? (this.slug = slugify(this.title, { lower: true, strict: true }))
    : console.log("title is not defined");
  this.blogBody
    ? (this.sanitizedHtml = DOMPurify.sanitize(this.blogBody))
    : console.log("title is not defined");
  next();
});

blogPostSchema.virtual("estReadTime").get(function () {
  const wC = wordCount(this.blogBody);
  let timeInMin = 1 + Math.floor(wC / 130);
  timeInMin === 1
    ? (timeInMin = `about ${timeInMin} min`)
    : (timeInMin = `about ${timeInMin} mins`);
  return timeInMin;
});

const BlogPost = mongoose.model("blogpost", blogPostSchema);

module.exports = BlogPost;
