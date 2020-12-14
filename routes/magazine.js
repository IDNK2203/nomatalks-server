const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary");
const path = require("path");
const fs = require("fs");
const Magazine = require("../models/magazine");
const router = express.Router();
const pdfMimeTypes = ["application/pdf"];
const fileMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];
const imageFileMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      imageFileMimeTypes.includes(file.mimetype)
        ? path.join("public/upload/", "image")
        : path.join("public/upload/", "files")
    );
  },
  filename: function (req, file, cb) {
    cb(
      null,
      path.basename(file.originalname, ".pdf") +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, fileMimeTypes.includes(file.mimetype));
  },
});

const multiUpload = upload.fields([
  { name: "digitalMagazine" },
  { name: "coverImage" },
]);
//  { magazine: magazine }
router.get("/create", async (req, res) => {
  res.render("create");
});

router.post("/", multiUpload, async (req, res, next) => {
  console.log(req.body, req.files);
  // get file path and create unique file name
  let magazine;
  try {
    magazine = new Magazine({
      issue: req.body.issue,
      snippet: req.body.snippet,
      author: req.body.author,
    });
    const { path: filePath, originalname } = req.files.coverImage[0];

    const fileExtName = path.extname(originalname);
    const uniqueFileName = path.basename(originalname, fileExtName);
    await uploadToCloudinaryAndSave(filePath, uniqueFileName, magazine);
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

let savePdf = (req, magazine) => {
  let { originalname, filename } = req.files.digitalMagazine[0];
  let originalName = path.basename(originalname, ".pdf");
  const url = `/upload/files/${filename}`;
  magazine.magazineTitle = originalName;
  magazine.magazineUrl = url;
};

let uploadToCloudinaryAndSave = async (path, uniqueFileName, magazine) => {
  try {
    const imageObj = await cloudinary.v2.uploader.upload(path, {
      public_id: uniqueFileName,
      folder: "file-bunker",
      tags: "blog",
    });
    magazine.coverImage = imageObj.url;
    fs.unlinkSync(path);
  } catch (error) {
    console.error(error);
  }
};

module.exports = router;
