const cloudinary = require("cloudinary");
const path = require("path");
const { body, validationResult, matchedData } = require("express-validator");
const {
  returnErrMsg,
  fileCheck,
  deleteFromCloudinary,
} = require("./globalUtils");
const BlogPost = require("../models/blogPost");
const Category = require("../models/category");
const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/ApiFeatures");

exports.uploadToCloudinaryAndSave = async (req, res, blog, next) => {
  const { path: fileImgPath, filename } = req.files.blogPostCI[0];
  try {
    const fileExtName = path.extname(filename);
    const uniqueFileName = path.basename(filename, fileExtName);
    imageObj = await cloudinary.v2.uploader.upload(fileImgPath, {
      public_id: uniqueFileName,
      folder: "file-bunker",
      tags: "blog-post",
    });
    fileCheck(fileImgPath);
    blog.blogPostCI[0].url = imageObj.url;
    blog.blogPostCI[0].publicId = imageObj.public_id;
  } catch (error) {
    console.log(error);
    fileCheck(fileImgPath);
    throw new Error(
      "CLOUDINARY_ERROR  occured during file upload please check your internet."
    );
  }
};

exports.basicGetRequestPresets = async (
  req,
  res,
  view,
  blog,
  hasError = false
) => {
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

exports.validationRules = () => {
  return [
    body("title", "Invalid Blog Title ").exists().isLength({ min: 1 }).trim(),
    body("snippet", "Snippet must have more than 5 characters")
      .exists()
      .isLength({ min: 5 })
      .isLength({ max: 150 })
      .withMessage("Snippet must have less than 150 characters")
      .trim(),
    body("blogBody", "InvalId Blog body input")
      .exists()
      .isLength({ min: 5 })
      .trim(),
    body("ImageAltText", "Invalid image Alt text input")
      .exists()
      .isLength({ min: 5 })
      .trim()
      .escape(),
    body("status", "blog status should be private or public")
      .isIn(["private", "public"])
      .trim(),
    body("guestAuthor", "Invalid Guest Author name").optional().trim().escape(),
    body("category", "Invalid category name").optional().trim(),
    body("publishedAt").isISO8601().toDate(),
  ];
};

exports.validate = (view) => {
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
        ImageAltText,
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
        blog.ImageAltText = ImageAltText;
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

exports.multerValidation = (multerConfig, view) => {
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

exports.createBlogView = async (req, res) => {
  basicGetRequestPresets(req, res, "create", new BlogPost({}));
};

exports.editBlogView = catchAsync(async (req, res) => {
  let blog = await BlogPost.findById(req.params.id);
  if (!blog) {
    return next(new AppError("No blog found with that slug", 404));
  }
  basicGetRequestPresets(req, res, "edit", blog);
});

exports.getAllBlogsView = catchAsync(async (req, res, next) => {
  const totalBlogsFound = await BlogPost.find().countDocuments({}).exec();
  const apiQuery = new ApiFeatures(req.query, BlogPost.find(), totalBlogsFound)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const blogs = await apiQuery.mongooseQuery.exec();
  const currentPage = apiQuery.page;
  const totalPages = Math.round(apiQuery.totalPages);
  res.render("admin/blog/index", {
    blogs,
    currentPage,
    totalPages,
    layout: "layouts/dashboard",
  });
});

exports.deleteBlog = catchAsync(async (req, res) => {
  let blog = await BlogPost.findById(req.params.id);
  if (!blog) {
    return next(new AppError("No blog found with that slug", 404));
  }
  await deleteFromCloudinary(blog.blogPostCI[0].publicId);
  await blog.remove();
  res.redirect("/admin/blog");
});
