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

router.use(authCheck, adminCheck);

router.get("/create", async (req, res) => {
  basicGetRequestPresets(req, res, "create", new BlogPost({}));
});

router.post(
  "/",
  multerValidation(multerConfig, "create"),
  validationRules(),
  validate("create"),
  async (req, res, next) => {
    let blog;
    try {
      blog = new BlogPost({
        blogPostCI: [{ url: null, publicId: null }],
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
    const blogs = await BlogPost.find().sort({ createdAt: "desc" }).exec();
    basicGetRequestPresets(req, res, "index", blogs);
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
    deleteFromCloudinary(blog.blogPostCI[0].publicId);
    await blog.remove();
    res.redirect("/admin/blog");
  } catch (error) {
    console.log(error);
    // res.redirect("/admin/blog");
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

module.exports = router;
