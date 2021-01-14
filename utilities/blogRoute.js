const cloudinary = require("cloudinary");
const path = require("path");
const { body, validationResult, matchedData } = require("express-validator");
const { returnErrMsg, fileCheck } = require("../utilities/globalUtils");
const BlogPost = require("../models/blogPost");
const Category = require("../models/category");
const multer = require("multer");

let uploadToCloudinaryAndSave = async (req, res, blog, next) => {
  const { path: fileImgPath, filename } = req.files.blogPostCI[0];
  let imageObj = null;
  try {
    const fileExtName = path.extname(filename);
    const uniqueFileName = path.basename(filename, fileExtName);
    imageObj = await cloudinary.v2.uploader.upload(fileImgPath, {
      public_id: uniqueFileName,
      folder: "file-bunker",
      tags: "blog-post",
    });
    fileCheck(fileImgPath);
    console.log(imageObj);
    blog.blogPostCI[0].url = imageObj.url;
    blog.blogPostCI[0].publicId = imageObj.public_id;
  } catch (error) {
    console.log(error);
    if (imageObj === null) {
      throw new Error(
        "unable to upload file to cloud storage check your internet"
      );
    }
  }
};

let basicGetRequestPresets = async (req, res, view, blog, hasError = false) => {
  let params = {};
  try {
    params.layout = "layouts/dashboard";
    const categories = await Category.find({});
    params.categories = categories;
    params.blogs = blog;
    params.blog = blog;
    if (hasError) {
      params.valError = hasError;
      if (req.files.blogPostCI != null && req.files.blogPostCI != "") {
        const { path: imgFilePath } = req.files.blogPostCI[0];
        // delete  IMAGE
        fileCheck(imgFilePath);
      }
    }
    res.render(`admin/blog/${view}`, params);
  } catch (error) {
    console.log(error);
  }
};

let validationRules = () => {
  return [
    body("title", "Invalid Blog Title ")
      .exists()
      .isLength({ min: 1 })
      .trim()
      .escape(),
    body("snippet", "Snippet must have more than 5 characters")
      .exists()
      .isLength({ min: 5 })
      .trim()
      .escape(),
    body("blogBody", "invalid Blog body input")
      .exists()
      .isLength({ min: 5 })
      .trim(),
    body("status", "blog status should be private or public")
      .optional()
      .isIn(["private", "public"]),
    body("guestAuthor", "Invalid Guest Author name").optional().trim().escape(),
    body("category", "Invalid category name").optional().trim().escape(),
    body("publishedAt").isISO8601().toDate(),
  ];
};

const validate = (view) => {
  return async (req, res, next) => {
    let blog;
    try {
      const {
        title,
        snippet,
        blogBody,
        status,
        publishedAt,
        guestAuthor,
        category,
      } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const extractedErrors = [];
        errors.array().map((err) => extractedErrors.push({ msg: err.msg }));
        blog = (await BlogPost.findById(req.params.id)) || new BlogPost({});
        blog.title = title;
        blog.snippet = snippet;
        blog.blogBody = blogBody;
        blog.status = status;
        blog.publishedAt = publishedAt;
        blog.category = category;
        blog.guestAuthor =
          guestAuthor != null && guestAuthor != "" ? guestAuthor : "";
        if (req.files.coverImage != null && req.files.coverImage != "") {
          const { path: imgFilePath } = req.files.coverImage[0];
          // delete  IMAGE
          fileCheck(imgFilePath);
        }
        basicGetRequestPresets(req, res, view, blog, extractedErrors);
      } else {
        const allData = matchedData(req);
        req.newBody = allData;
        next();
      }
    } catch (error) {
      console.log(error);
    }
  };
};

let multerValidation = (multerConfig, view) => {
  return async (req, res, next) => {
    multerConfig(req, res, function (err) {
      generalValidation(req, res, next, view, err);
    });
  };
};

const generalValidation = async (req, res, next, view, err) => {
  try {
    const blog = (await BlogPost.findById(req.params.id)) || new BlogPost({});
    if (err instanceof multer.MulterError) {
      const errMsg = returnErrMsg(`${err.code} of ${err.field} field`);
      return basicGetRequestPresets(req, res, view, blog, errMsg);
    } else if (req.fileValidationError) {
      const errMsg = returnErrMsg(req.fileValidationError);
      return basicGetRequestPresets(req, res, view, blog, errMsg);
    } else {
      if (req.method === "POST") {
        POSTVal(req, res, next, view, blog);
      } else {
        next();
      }
    }
  } catch (error) {
    console.log(error);
  }
};
const POSTVal = (req, res, next, view, blog) => {
  if (!req.files.blogPostCI) {
    const errMsg = returnErrMsg("upload a cover Image");
    return basicGetRequestPresets(req, res, view, blog, errMsg);
  } else {
    next();
  }
};

module.exports = {
  uploadToCloudinaryAndSave,
  basicGetRequestPresets,
  validationRules,
  validate,
  multerValidation,
};
