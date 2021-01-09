const express = require("express");
const path = require("path");
var multer = require("multer");
const BlogPost = require("../models/blogPost");
const router = express.Router();
// configs
const multerConfig = require("../config/multer");
require("../config/cloudinary");

// utilities
// const {
//   savePdf,
//   uploadToCloudinaryAndSave,
//   deleteFromCloudinary,
//   deletePdf,
//   basicGetRequestPresets,
//   validationRules,
//   validate,
//   returnErrMsg,
//   multerValidation_POST,
//   multerValidation_PUT,
// } = require("../utilities/blogRoute");
const { authCheck, adminCheck } = require("../utilities/auth");

router.use(authCheck, adminCheck);

router.get("/create", async (req, res) => {
  res.render("admin/blog/create", {
    layout: "layouts/dashboard",
    BlogPost: new BlogPost({}),
  });
});

router.get("/privateStatus", async (req, res) => {
  res.send("why you always in the mood");
});

router.post("/", async (req, res, next) => {
  res.send("why you always in the mood");
});

router.get("/", async (req, res) => {
  res.send("why you always in the mood");
});

router.get("/edit/:id", async (req, res) => {
  res.send("why you always in the mood");
});

router.delete("/:id", async (req, res) => {
  res.send("why you always in the mood");
});

router.put("/:id", async (req, res, next) => {
  res.send("why you always in the mood");
});

module.exports = router;
