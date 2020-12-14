const express = require("express");
const path = require("path");
const Magazine = require("../models/magazine");
const router = express.Router();
// configs
const multer = require("../config/multer");
const cloudinary = require("../config/cloudinary");
// utilities
const {
  savePdf,
  uploadToCloudinaryAndSave,
} = require("../utilities/magazinesRoute");

//  { magazine: magazine }
router.get("/create", async (req, res) => {
  res.render("create");
});

router.post("/", multer, async (req, res, next) => {
  console.log(req.body, req.files);
  // get file path and create unique file name
  let magazine;
  try {
    magazine = new Magazine({
      issue: req.body.issue,
      snippet: req.body.snippet,
      author: req.body.author,
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
    res.render("index", { magazines: magazines });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
