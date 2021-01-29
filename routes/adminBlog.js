const express = require("express");
const BlogPost = require("../models/blogPost");
const router = express.Router();
// configs
const multerConfig = require("../config/multer");
require("../config/cloudinary");

// blog route utilities
const {
  uploadToCloudinaryAndSave,
  basicGetRequestPresets,
  validationRules,
  validate,
  multerValidation,
} = require("../utilities/blogRoute");

// global route utilities
const {
  returnErrMsg,
  deleteFromCloudinary,
} = require("../utilities/globalUtils");

// authentication utilities
const { authCheck, adminCheck } = require("../utilities/auth");
const blogsPerPage = 3; // results per page
router.use(authCheck, adminCheck);

router.get("/create", async (req, res) => {
  basicGetRequestPresets(req, res, "create", new BlogPost({}));
});
// ImageAltText
router.post(
  "/",
  multerValidation(multerConfig, "create"),
  validationRules(),
  validate("create"),
  async (req, res, next) => {
    let blog;
    try {
      blog = new BlogPost({
        blogPostCI: [
          { url: null, publicId: null, ImageAltText: req.newBody.ImageAltText },
        ],
        title: req.newBody.title,
        snippet: req.newBody.snippet,
        user: req.user.id,
        blogBody: req.newBody.blogBody,
        status: req.newBody.status,
        category: req.newBody.category,
        guestAuthor:
          req.newBody.guestAuthor != null && req.newBody.guestAuthor != ""
            ? req.newBody.guestAuthor
            : "",
        publishedAt:
          req.newBody.publishedAt != null && req.newBody.publishedAt != ""
            ? new Date(req.newBody.publishedAt)
            : "",
      });
      await uploadToCloudinaryAndSave(req, res, blog, next);
      const newBlog = await blog.save();
      res.redirect("/admin/blog");
    } catch (error) {
      console.error(error);
      let errMsg;
      errMsg = returnErrMsg(error);
      basicGetRequestPresets(req, res, "create", blog, errMsg);
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const blogs = await BlogPost.find()
      .sort({ createdAt: -1 })
      .limit(blogsPerPage)
      .exec();
    const page = req.params.page || 1; // Page
    const totalBlogsFound = await BlogPost.find().countDocuments({}).exec();
    const totalPages = totalBlogsFound / blogsPerPage;
    res.render("admin/blog/index", {
      blogs,
      currentPage: page,
      totalBlogsFound,
      totalPages,
      layout: "layouts/dashboard",
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    let blog = await BlogPost.findById(req.params.id);
    basicGetRequestPresets(req, res, "edit", blog);
    if (!blog) {
      return next(new AppError("No blog found with that slug", 404));
    }
  } catch (error) {
    // res.redirect("/admin/blog");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let blog = await BlogPost.findById(req.params.id);
    if (!blog) {
      return next(new AppError("No blog found with that slug", 404));
    }
    await deleteFromCloudinary(blog.blogPostCI[0].publicId);
    await blog.remove();
    res.redirect("/admin/blog");
  } catch (error) {
    console.log(error);
    req.flash("error_msg", error.message);
    res.redirect("/admin/blog");
  }
});

router.put(
  "/:id",
  multerValidation(multerConfig, "edit"),
  validationRules(),
  validate("edit"),
  async (req, res, next) => {
    let blog;
    try {
      blog = await BlogPost.findById(req.params.id);
      blog.title = req.newBody.title;
      blog.snippet = req.newBody.snippet;
      blog.blogBody = req.newBody.blogBody;
      blog.status = req.newBody.status;
      blog.blogPostCI[0].ImageAltText = req.newBody.ImageAltText;

      blog.category = req.newBody.category;
      blog.publishedAt =
        req.newBody.publishedAt != null && req.newBody.publishedAt != ""
          ? new Date(req.newBody.publishedAt)
          : "";
      blog.guestAuthor =
        req.newBody.guestAuthor != null && req.newBody.guestAuthor != ""
          ? req.newBody.guestAuthor
          : "";

      if (req.files.blogPostCI != null && req.files.blogPostCI != "") {
        deleteFromCloudinary(blog.blogPostCI[0].publicId);
        await uploadToCloudinaryAndSave(req, res, blog, next);
      }
      await blog.save();
      res.redirect("/admin/blog");
    } catch (error) {
      console.log(error);
      if (blog == null) {
        res.redirect("/admin/blog");
      } else {
        let errMsg;
        errMsg = returnErrMsg(error);
        basicGetRequestPresets(req, res, "edit", blog, errMsg);
        console.error(error);
      }
    }
  }
);

router.get("/:slug", async (req, res) => {
  try {
    const blog = await BlogPost.findOne({ slug: req.params.slug }).populate(
      "user"
    );
    if (!blog) {
      return next(new AppError("No blog found with that slug", 404));
    }
    res.render("blog/show", { blog });
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
    res.render("admin/blog/index", {
      blogs: blogsFound,
      currentPage: page,
      totalBlogsFound,
      totalPages,
      layout: "layouts/dashboard",
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
