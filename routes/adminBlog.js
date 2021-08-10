const router = require("express").Router();
const BlogPost = require("../models/blogPost");
// configs
const multerConfig = require("../config/multer");
require("../config/cloudinary");

// blog route controllers
const blogControllers = require("../controllers/blogControllers");

// global route controllers
const {
  returnErrMsg,
  deleteFromCloudinary,
} = require("../controllers/globalUtils");

// authentication controllers
const { authCheck, adminCheck } = require("../controllers/auth");

router.use(authCheck, adminCheck);

// @VIEW ROUTES
router.get("/create", blogControllers.createBlogView);

router.get("/edit/:id", blogControllers.editBlogView);

router.get("/", blogControllers.getAllBlogsView);

// @API ROUTES
router.delete("/:id", blogControllers.deleteBlog);

// api  post route
router.post(
  "/",
  blogControllers.multerValidation(multerConfig, "create"),
  blogControllers.validationRules(),
  blogControllers.validate("create"),
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
      await blogControllers.uploadToCloudinaryAndSave(req, res, blog, next);
      const newBlog = await blog.save();
      res.redirect("/admin/blog");
    } catch (error) {
      console.error(error);
      let errMsg;
      errMsg = returnErrMsg(error);
      blogControllers.basicGetRequestPresets(req, res, "create", blog, errMsg);
    }
  }
);

// api update route
router.put(
  "/:id",
  blogControllers.multerValidation(multerConfig, "edit"),
  blogControllers.validationRules(),
  blogControllers.validate("edit"),
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
        await blogControllers.uploadToCloudinaryAndSave(req, res, blog, next);
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
        blogControllers.basicGetRequestPresets(req, res, "edit", blog, errMsg);
        console.error(error);
      }
    }
  }
);

module.exports = router;
