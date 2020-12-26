const express = require("express");
const path = require("path");
const Magazine = require("../../models/magazine");
const router = express.Router();
// configs
const multer = require("../../config/multer");
require("../../config/cloudinary");
// utilities
const {
  savePdf,
  uploadToCloudinaryAndSave,
  deleteFromCloudinary,
  deletePdf,
} = require("../../utilities/magazinesRoute");
const { authCheck, adminCheck } = require("../../utilities/auth");

router.use(authCheck);

router.get("/create", async (req, res) => {
  res.render("admin/magazine/create", {
    magazine: new Magazine({}),
    layout: "layouts/dashboard",
  });
});

router.post("/", multer, async (req, res, next) => {
  // console.log(req.body, req.files);
  let magazine;
  try {
    magazine = new Magazine({
      issue: req.body.issue,
      snippet: req.body.snippet,
      author: req.body.author,
      coverImage: [{ url: null, publicId: null }],
    });
    await uploadToCloudinaryAndSave(req, magazine);
    savePdf(req, magazine);
    const newMagazine = await magazine.save();
    res.redirect("/magazine");
  } catch (error) {
    console.error(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const magazines = await Magazine.find();
    res.render("admin/magazine/index", {
      magazines: magazines,
      layout: "layouts/dashboard",
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    let mag = await Magazine.findById(req.params.id);
    res.render("admin/magazine/edit", {
      magazine: mag,
      layout: "layouts/dashboard",
    });
  } catch (error) {
    // if(mag == null){
    res.redirect("/admin/magazine");
    // }
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let mag = await Magazine.findById(req.params.id);
    deleteFromCloudinary(mag.coverImage[0].publicId);
    deletePdf(mag.magazineUrl);
    mag.remove();
    res.redirect("/admin/magazine");
  } catch (error) {
    // if(mag == null){
    res.redirect("/magazine");
    // }
  }
});

router.put("/:id", multer, async (req, res) => {
  let mag;
  try {
    const id = req.params.id;
    mag = await Magazine.findById(id);
    mag.issue = req.body.issue;
    mag.snippet = req.body.snippet;
    mag.author = req.body.author;
    if (req.files.coverImage != null && req.files.coverImage != "") {
      deleteFromCloudinary(mag.coverImage[0].publicId);
      await uploadToCloudinaryAndSave(req, mag);
    }
    if (req.files.digitalMagazine != null && req.files.digitalMagazine != "") {
      deletePdf(mag.magazineUrl);
      savePdf(req, mag);
    }
    await mag.save();
    res.redirect("/magazine");
  } catch (error) {
    console.log(error);
    if (mag == null) {
      res.redirect("/admin/magazine");
    }
  }
});

module.exports = router;
