const express = require("express");
const BlogPost = require("../models/blogPost");
const router = express.Router();

const AppError = require("../helpers/appError");
// utilities
router.get("/", async (req, res) => {
  try {
    const blogs = await BlogPost.find()
      .sort({ createdAt: "desc" })
      .populate("user")
      .where("status")
      .equals("public")
      .exec();
    let searchOpts = req.query;
    res.render("blog/index", { blogs, searchOpts });
  } catch (error) {
    console.log(error);
  }
});

router.get("/results", async (req, res) => {
  try {
    let query = BlogPost.find();
    if (req.query.blogTitle != null && req.query.blogTitle != "") {
      query.regex("title", new RegExp(req.query.blogTitle, "i")).limit(10);
    }
    const blogs = await query
      .sort({ createdAt: "desc" })
      .populate("user")
      .where("status")
      .equals("public")
      .exec();
    let searchOpts = req.query;
    res.render("blog/results", { blogs, searchOpts });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const blog = await BlogPost.findOne({ slug: req.params.slug })
      .populate("user")
      .where("status")
      .equals("public")
      .exec();
    if (!blog) {
      return next(new AppError("No blog found with that slug", 404));
    }
    res.render("blog/show", { blog });
  } catch (error) {
    console.log(error);
  }
});

router.get("/category/:category", async (req, res) => {
  try {
    const query = new RegExp(req.params.category, "i");
    const blogs = await BlogPost.find({
      category: query,
    })
      .where("status")
      .equals("public")
      .exec();
    res.render("blog/category", { blogs, category: req.params.category });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
