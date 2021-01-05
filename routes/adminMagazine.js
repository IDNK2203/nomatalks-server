const express = require("express");
const path = require("path");
var multer = require("multer");
const Magazine = require("../models/magazine");
const router = express.Router();
// configs
const multerConfig = require("../config/multer");
require("../config/cloudinary");
// utilities
const {
  savePdf,
  uploadToCloudinaryAndSave,
  deleteFromCloudinary,
  deletePdf,
  basicGetRequestPresets,
  validationRules,
  validate,
  returnErrMsg,
  multerValidation_POST,
  multerValidation_PUT,
} = require("../utilities/magazinesRoute");
const { authCheck, adminCheck } = require("../utilities/auth");

router.use(authCheck, adminCheck);
// router.use(adminCheck);

router.get("/create", async (req, res) => {
  basicGetRequestPresets(req, res, "create", new Magazine({}));
});

router.get("/privateStatus", async (req, res) => {
  let query = Magazine.find();
  try {
    const magazines = await query
      .sort({ createdAt: "desc" })
      .where("privateStatus")
      .equals("true")
      .exec();
    res.render("admin/magazine/privateStatus", {
      magazines,
      layout: "layouts/dashboard",
    });
  } catch (error) {
    console.log(error);
  }
});

router.post(
  "/",
  multerValidation_POST(multerConfig),
  validationRules(),
  validate("create"),
  async (req, res, next) => {
    let magazine;
    const { author, snippet, issue } = req.newBody;
    try {
      magazine = new Magazine({
        coverImage: [{ url: null, publicId: null }],
        privateStatus: req.body.privateStatus == "on" ? true : false,
        issue: issue,
        snippet: snippet,
        author: author,
      });
      await uploadToCloudinaryAndSave(req, res, magazine, next);
      savePdf(req, magazine);
      const newMagazine = await magazine.save();
      res.redirect("/admin/magazine");
    } catch (error) {
      let errMsg;
      errMsg = returnErrMsg(error);
      basicGetRequestPresets(req, res, "create", magazine, errMsg);
      console.error(error);
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const magazines = await Magazine.find();
    basicGetRequestPresets(req, res, "index", magazines);
  } catch (error) {
    console.log(error);
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    let mag = await Magazine.findById(req.params.id);
    basicGetRequestPresets(req, res, "edit", mag);
  } catch (error) {
    res.redirect("/admin/magazine");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let mag = await Magazine.findById(req.params.id);
    deleteFromCloudinary(mag.coverImage[0].publicId);
    await mag.remove();
    res.redirect("/admin/magazine");
    deletePdf(mag.magazineUrl);
  } catch (error) {
    console.log(error);
    res.redirect("/magazine");
  }
});

router.put(
  "/:id",
  multerValidation_PUT(multerConfig),
  validationRules(),
  validate("edit"),
  async (req, res, next) => {
    let mag;
    try {
      mag = await Magazine.findById(req.params.id);
      const { author, snippet, issue } = req.newBody;
      mag.issue = issue;
      mag.snippet = snippet;
      mag.author = author;
      mag.privateStatus = req.body.privateStatus == "on" ? true : false;
      if (req.files.coverImage != null && req.files.coverImage != "") {
        deleteFromCloudinary(mag.coverImage[0].publicId);
        await uploadToCloudinaryAndSave(req, res, mag, next);
      }
      if (
        req.files.digitalMagazine != null &&
        req.files.digitalMagazine != ""
      ) {
        deletePdf(mag.magazineUrl);
        savePdf(req, mag);
      }
      await mag.save();
      res.redirect("/admin/magazine");
    } catch (error) {
      console.log(error);
      if (mag == null) {
        res.redirect("/admin/magazine");
      } else {
        let errMsg;
        errMsg = returnErrMsg(error);
        basicGetRequestPresets(req, res, "edit", mag, errMsg);
        console.error(error);
      }
    }
  }
);

module.exports = router;
