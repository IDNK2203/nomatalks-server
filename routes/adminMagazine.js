const express = require("express");
const Magazine = require("../models/magazine");
const router = express.Router();
// configs
const multerConfig = require("../config/multer");
require("../config/cloudinary");
// utilities
const {
  savePdf,
  uploadToCloudinaryAndSave,
  deletePdf,
  basicGetRequestPresets,
  validationRules,
  validate,
  multerValidation,
} = require("../utilities/magazinesRoute");
const {
  deleteFromCloudinary,
  returnErrMsg,
} = require("../utilities/globalUtils");
const { authCheck, adminCheck } = require("../utilities/auth");

router.use(authCheck, adminCheck);

// @desc show create magazine page
// @route /admin/magazine/create
router.get("/create", async (req, res) => {
  basicGetRequestPresets(req, res, "create", new Magazine({}));
});

router.post(
  "/",
  multerValidation(multerConfig, "create"),
  validationRules(),
  validate("create"),
  async (req, res, next) => {
    let magazine;
    try {
      magazine = new Magazine({
        coverImage: [{ url: null, publicId: null }],
        issue: req.newBody.issue,
        snippet: req.newBody.snippet,
        author: req.newBody.author,
        status: req.newBody.status,
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
  multerValidation(multerConfig, "edit"),
  validationRules(),
  validate("edit"),
  async (req, res, next) => {
    let mag;
    try {
      mag = await Magazine.findById(req.params.id);
      mag.issue = req.newBody.issue;
      mag.snippet = req.newBody.snippet;
      mag.author = req.newBody.author;
      mag.status = req.newBody.status;
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

router.get("/:slug", async (req, res) => {
  try {
    const magazine = await Magazine.findOne({ slug: req.params.slug });
    res.render("magazine/show", { magazine });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
