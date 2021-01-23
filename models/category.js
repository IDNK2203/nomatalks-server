const mongoose = require("mongoose");
const BlogPost = require("./blogPost");
const slugify = require("slugify");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["primary", "secondary"],
    },
  },
  { timestamps: true }
);

categorySchema.pre("validate", function (next) {
  this.name
    ? (this.slug = slugify(this.name, { lower: true, strict: true }))
    : console.log("name is not defined");
  next();
});

categorySchema.pre("remove", function (next) {
  // find books that were written by this particular author
  BlogPost.find({ category: this.name }, (err, blogs) => {
    if (err) {
      next(err);
    } else if (blogs.length > 0) {
      next(new Error("There are blogs with this Category"));
    } else {
      next();
    }
  });
});

const Category = mongoose.model("category", categorySchema);
module.exports = Category;
