const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary");
const path = require("path");
const fs = require("fs");
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
    cb(null, file.originalname + "-" + Date.now());
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

router.post("/", multiUpload, function (req, res, next) {
  console.log(req.body, req.files);
  res.redirect("/");
  // get file path and create unique file name
  // const path = req.file.path;
  // const uniqueFileName = `${req.file.originalname}${new Date().toISOString}`;
  // uploadToCloudinary(path, uniqueFileName, res);
});

let uploadToCloudinary = async (path, uniqueFileName, res) => {
  try {
    const imageObj = await cloudinary.uploader.upload(path, {
      public_id: `blog/${uniqueFileName}`,
      tags: "blog",
    });
    res.json(imageObj);
    fs.unlinkSync(path);
  } catch (error) {
    console.error(error);
  }
};

// console.log(path.join("public", "images"));
module.exports = router;
