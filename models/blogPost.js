const ert = require("estimated-reading-time");
const mongoose = require("mongoose");

const slugify = require("slugify");
const createDOMPurify = require("dompurify");
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
        ImageAltText: String,
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
    ? (this.slug = slugify(this.title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      }))
    : console.log("title is not defined");
  this.blogBody
    ? (this.sanitizedHtml = DOMPurify.sanitize(this.blogBody))
    : console.log("blog body is not defined");
  this.snippet
    ? (this.snippet = DOMPurify.sanitize(this.snippet))
    : console.log("snippet is not defined");
  next();
});

blogPostSchema.virtual("estReadTime").get(function () {
  const { estimatedReadingTime, TextFormat } = ert;
  const res = estimatedReadingTime(this.sanitizedHtml, TextFormat.HTML, {
    isTechnical: false,
    wordsPerMinute: 130,
  });
  let timeInMin = res.roundedMinutes;
  timeInMin < 2
    ? (timeInMin = `${timeInMin} min Read`)
    : (timeInMin = `${timeInMin} mins Read`);
  return timeInMin;
});

const BlogPost = mongoose.model("blogpost", blogPostSchema);

module.exports = BlogPost;
