const express = require("express");
const path = require("path");
const BlogPost = require("../models/blogPost");
const Category = require("../models/category");
const router = express.Router();
// configs
const multerConfig = require("../config/multer");
require("../config/cloudinary");

// utilities
const {
  uploadToCloudinaryAndSave,
  basicGetRequestPresets,
  validationRules,
  validate,
  multerValidation,
} = require("../utilities/blogRoute");
// utilities
const {
  returnErrMsg,
  deleteFromCloudinary,
} = require("../utilities/globalUtils");
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
    let {
      title,
      snippet,
      blogBody,
      status,
      publishedAt,
      guestAuthor,
      category,
    } = req.body;
    try {
      blog = new BlogPost({
        blogPostCI: [{ url: null, publicId: null }],
        title: title,
        snippet: snippet,
        user: req.user.id,
        blogBody: blogBody,
        status: status,
        category: category,
        guestAuthor:
          guestAuthor != null && guestAuthor != "" ? guestAuthor : "",
        publishedAt:
          publishedAt != null && publishedAt != "" ? new Date(publishedAt) : "",
      });
      await uploadToCloudinaryAndSave(req, res, blog, next);
      const newBlog = await blog.save();
      res.redirect("/admin/blog");
    } catch (error) {
      let errMsg;
      errMsg = returnErrMsg(error);
      basicGetRequestPresets(req, res, "create", blog, errMsg);
      console.error(error);
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const blogs = await BlogPost.find();
    basicGetRequestPresets(req, res, "index", blogs);
  } catch (error) {
    console.log(error);
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    let blog = await BlogPost.findById(req.params.id);
    basicGetRequestPresets(req, res, "edit", blog);
  } catch (error) {
    res.redirect("/admin/blog");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let blog = await BlogPost.findById(req.params.id);
    deleteFromCloudinary(blog.blogPostCI[0].publicId);
    await blog.remove();
    res.redirect("/admin/blog");
  } catch (error) {
    console.log(error);
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
      let {
        title,
        snippet,
        blogBody,
        status,
        publishedAt,
        guestAuthor,
        category,
      } = req.body;
      blog.title = title;
      blog.snippet = snippet;
      blog.blogBody = blogBody;
      blog.status = status;
      blog.category = category;
      blog.publishedAt =
        publishedAt != null && publishedAt != "" ? new Date(publishedAt) : "";
      blog.guestAuthor =
        guestAuthor != null && guestAuthor != "" ? guestAuthor : "";

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
    res.render("blog/show", { blog });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
