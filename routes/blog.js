const express = require("express");
const safe = require("safe-regex");
const BlogPost = require("../models/blogPost");
const Category = require("../models/category");
const router = express.Router();

const AppError = require("../helpers/appError");
// utilities
const blogsPerPage = 3; // results per page
router.get("/", async (req, res) => {
  try {
    const blogs = await BlogPost.find()
      .sort({ createdAt: -1 })
      .populate("user")
      .limit(blogsPerPage)
      .where("status")
      .equals("public")
      .exec();
    let searchOpts = req.query;
    const page = req.params.page || 1; // Page
    const totalBlogsFound = await BlogPost.find().countDocuments({}).exec();
    const navCategories = await Category.find();
    const totalPages = totalBlogsFound / blogsPerPage;
    res.render("blog/index", {
      navCategories,
      blogs,
      searchOpts,
      currentPage: page,
      totalBlogsFound,
      totalPages,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/results", async (req, res) => {
  try {
    const page = req.params.page || 1; // Page
    let query = BlogPost.find();
    if (req.query.blogTitle != null && req.query.blogTitle != "") {
      const searchRegex = new RegExp(req.query.blogTitle, "i");
      if (safe(searchRegex)) {
        query.regex("title", searchRegex).limit(blogsPerPage);
        // blogs found to be displayed on the selected page
        const blogsFound = await query
          .skip(blogsPerPage * page - blogsPerPage)
          .limit(blogsPerPage)
          .sort({ createdAt: -1 })
          .exec();
        // total blogs found
        const totalBlogsFound = await BlogPost.find()
          .regex("title", searchRegex)
          .countDocuments({})
          .exec();
        const totalPages = totalBlogsFound / blogsPerPage;
        let searchOpts = req.query;
        res.render("blog/results", {
          searchOpts,
          blogs: blogsFound,
          currentPage: page,
          totalBlogsFound,
          totalPages,
        });
      } else {
        req.flash("error_msg", "try Again");
        res.redirect("/blog");
      }
    } else {
      req.flash(
        "error_msg",
        "please fill in a valid Blog Title in the search input"
      );
      res.redirect("/");
    }
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
    const blogs = await BlogPost.find({
      category: req.params.category,
    })
      .sort({ createdAt: -1 })
      .populate("user")
      .limit(blogsPerPage)
      .where("status")
      .equals("public")
      .exec();
    let searchOpts = req.query;
    const page = req.params.page || 1; // Page
    const totalBlogsFound = await BlogPost.find({
      category: req.params.category,
    })
      .countDocuments({})
      .exec();
    const totalPages = totalBlogsFound / blogsPerPage;
    res.render("blog/category", {
      category: req.params.category,
      searchOpts,
      blogs,
      currentPage: page,
      totalBlogsFound,
      totalPages,
    });
  } catch (error) {
    console.log(error);
  }
});

// paginated routes
router.get("/page/:page", async (req, res, next) => {
  const page = req.params.page || 1; // Page
  try {
    const blogsFound = await BlogPost.find()
      .skip(blogsPerPage * page - blogsPerPage)
      .sort({ createdAt: -1 })
      .limit(blogsPerPage)
      .exec();
    const totalBlogsFound = await BlogPost.find().countDocuments({}).exec();
    const totalPages = totalBlogsFound / blogsPerPage;
    let searchOpts = req.query;
    res.render("blog/index", {
      searchOpts,
      blogs: blogsFound,
      currentPage: page,
      totalBlogsFound,
      totalPages,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/category/page/:page", async (req, res, next) => {
  const page = req.params.page || 1; // Page
  try {
    let query = BlogPost.find({
      category: req.params.category,
    });
    const blogsFound = await query
      .skip(blogsPerPage * page - blogsPerPage)
      .limit(blogsPerPage)
      .sort({ createdAt: -1 })
      .exec();
    const totalBlogsFound = await BlogPost.find().countDocuments({}).exec();
    const totalPages = totalBlogsFound / blogsPerPage;
    let searchOpts = req.query;
    res.render("blog/category", {
      category: req.query.category,
      searchOpts,
      blogs: blogsFound,
      currentPage: page,
      totalBlogsFound,
      totalPages,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/results/page/:page", async (req, res, next) => {
  const page = req.params.page || 1; // Page
  try {
    let query = BlogPost.find();
    if (req.query.blogTitle != null && req.query.blogTitle != "") {
      const searchRegex = new RegExp(req.query.blogTitle, "i");
      if (safe(searchRegex)) {
        const blogsFound = await query
          .skip(blogsPerPage * page - blogsPerPage)
          .limit(blogsPerPage)
          .sort({ createdAt: -1 })
          .exec();
        const totalBlogsFound = await BlogPost.find().countDocuments({}).exec();
        const totalPages = totalBlogsFound / blogsPerPage;
        let searchOpts = req.query;
        res.render("blog/results", {
          searchOpts,
          blogs: blogsFound,
          currentPage: page,
          totalBlogsFound,
          totalPages,
        });
      } else {
        req.flash("error_msg", "Try a different search term.");
        res.redirect("/blog");
      }
    } else {
      req.flash(
        "error_msg",
        "please fill in a valid Blog Title in the search input."
      );
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
