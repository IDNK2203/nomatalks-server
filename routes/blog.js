const express = require("express");
const safe = require("safe-regex");
const BlogPost = require("../models/blogPost");
const Category = require("../models/category");
const router = express.Router();
const AppError = require("../helpers/appError");
// utilities
const {
  blogQueryChain,
  blogsQueryChain,
  getPageData,
  getSinglePageData,
} = require("../utilities/blogRoutes");

router.get("/", async (req, res) => {
  try {
    const query = BlogPost.find();
    const totalBlogsFound = await BlogPost.find().countDocuments({}).exec();
    const blogsFound = await blogsQueryChain(query, req).exec();
    let pageData = await getPageData(req, totalBlogsFound);
    pageData.blogsFound = blogsFound;
    pageData.totalBlogsFound = totalBlogsFound;
    pageData.pageTitle = "Home";
    res.render("blog/index", pageData);
  } catch (error) {
    console.log(error);
  }
});

router.get("/results", async (req, res) => {
  try {
    if (req.query.blogTitle != null && req.query.blogTitle != "") {
      const searchRegex = new RegExp(req.query.blogTitle, "i");
      if (safe(searchRegex)) {
        let query = BlogPost.find().regex("title", searchRegex);
        const blogsFound = await blogsQueryChain(query, req).exec();
        const totalBlogsFound = await BlogPost.find()
          .regex("title", searchRegex)
          .countDocuments({})
          .exec();
        let pageData = await getPageData(req, totalBlogsFound);
        pageData.blogsFound = blogsFound;
        pageData.totalBlogsFound = totalBlogsFound;
        pageData.pageTitle = "search results";

        res.render("blog/results", pageData);
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
    let blogQuery = BlogPost.findOne({ slug: req.params.slug });
    let blog = await blogQueryChain(blogQuery).exec();
    if (!blog) {
      return next(new AppError("No blog found with that slug", 404));
    }
    const relatedBlogsQuery = BlogPost.find({
      category: blog.category,
      _id: { $ne: blog.id },
    });
    let relatedBlogs = await blogQueryChain(relatedBlogsQuery).exec();
    let pageData = await getSinglePageData(req);
    pageData.relatedBlogs = relatedBlogs;
    pageData.pageTitle = blog.title;
    pageData.blog = blog;

    res.render("blog/show", pageData);
  } catch (error) {
    console.log(error);
  }
});

router.get("/category/:categorySlug", async (req, res, next) => {
  try {
    const categoryName = await Category.findOne({
      slug: req.params.categorySlug,
    }).select("name");
    if (!categoryName) {
      return next(new AppError("This blog category does not exist", 404));
    }
    let query = BlogPost.find({ category: req.params.categorySlug });
    const blogsFound = await blogsQueryChain(query, req).exec();
    const totalBlogsFound = await BlogPost.find({
      category: req.params.categorySlug,
    })
      .countDocuments({})
      .exec();
    let pageData = await getPageData(req, totalBlogsFound);
    pageData.blogsFound = blogsFound;
    pageData.totalBlogsFound = totalBlogsFound;
    pageData.categoryName = categoryName;
    pageData.category = req.params.categorySlug;
    pageData.pageTitle = `${categoryName.name} Category`;

    res.render("blog/category", pageData);
  } catch (error) {
    console.log(error);
  }
});

// paginated routes
router.get("/page/:page", async (req, res, next) => {
  try {
    let query = BlogPost.find();
    const blogsFound = await blogsQueryChain(query, req).exec();
    const totalBlogsFound = await BlogPost.find().countDocuments({}).exec();
    let pageData = await getPageData(req, totalBlogsFound);
    pageData.blogsFound = blogsFound;
    pageData.totalBlogsFound = totalBlogsFound;
    pageData.pageTitle = `Home | `;

    res.render("blog/index", pageData);
  } catch (error) {
    console.log(error);
  }
});

router.get("/category/page/:page", async (req, res, next) => {
  try {
    const categoryName = await Category.findOne({
      slug: req.query.category,
    }).select("name");
    if (!categoryName) {
      return next(new AppError("This blog category does not exist", 404));
    }
    let query = BlogPost.find({ category: req.query.category });
    const blogsFound = await blogsQueryChain(query, req).exec();
    const totalBlogsFound = await BlogPost.find({
      category: req.query.category,
    })
      .countDocuments({})
      .exec();
    let pageData = await getPageData(req, totalBlogsFound);
    pageData.blogsFound = blogsFound;
    pageData.totalBlogsFound = totalBlogsFound;
    pageData.categoryName = categoryName;
    pageData.category = req.query.category;
    pageData.pageTitle = `${categoryName.name} Category`;
    res.render("blog/category", pageData);
  } catch (error) {
    console.log(error);
  }
});

router.get("/results/page/:page", async (req, res, next) => {
  try {
    let query = BlogPost.find();
    if (req.query.blogTitle != null && req.query.blogTitle != "") {
      const searchRegex = new RegExp(req.query.blogTitle, "i");
      if (safe(searchRegex)) {
        const blogsFound = await blogsQueryChain(query, req).exec();
        const totalBlogsFound = await BlogPost.find().countDocuments({}).exec();
        let pageData = await getPageData(req, totalBlogsFound);
        pageData.blogsFound = blogsFound;
        pageData.totalBlogsFound = totalBlogsFound;
        pageData.pageTitle = `search results`;
        res.render("blog/results", pageData);
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
