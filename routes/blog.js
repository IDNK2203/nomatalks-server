const express = require("express");
const path = require("path");
var multer = require("multer");
// const Magazine = require("../models/blog");
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
// const { authCheck, adminCheck } = require("../utilities/auth");

// router.use(authCheck, adminCheck);
// router.use(adminCheck);

router.get("/", async (req, res) => {
  res.send("why you always in the mood");
});

router.get("/:id", async (req, res) => {
  res.send("why you always in the mood");
});

router.get("/category/:id", async (req, res) => {
  res.send("why you always in the mood");
});

router.get("/", async (req, res) => {
  res.send("why you always in the mood");
});

router.get("/", async (req, res) => {
  res.send("why you always in the mood");
});

module.exports = router;
