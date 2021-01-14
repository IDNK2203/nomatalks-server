const mongoose = require("mongoose");
const BlogPost = require("./blogPost");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

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
