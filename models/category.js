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
      trim: true,
      lowercase: true,
    },
    slug: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["primary", "secondary"],
    },
  },
  { timestamps: true }
);

const createSlug = (doc) => {
  doc.slug = slugify(doc.name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

categorySchema.pre("save", function (next) {
  createSlug(this);
  next();
});

categorySchema.post(/^findOneAndUpdate/, async function () {
  const doc = await this.findOne();
  createSlug(doc);
});

categorySchema.pre(/^findOneAndDelete/, async function (next) {
  try {
    const doc = await this.findOne();
    const blogs = await BlogPost.find({ category: doc.name });
    if (blogs.length > 0) {
      return next(new Error("There are blogs with this Category"));
    }
  } catch (err) {
    next(err);
  }
});

const Category = mongoose.model("category", categorySchema);
module.exports = Category;
