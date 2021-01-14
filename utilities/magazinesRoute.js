const cloudinary = require("cloudinary");
const path = require("path");
const fs = require("fs");
const { body, validationResult, matchedData } = require("express-validator");
const { fileCheck, returnErrMsg } = require("../utilities/globalUtils");
const Magazine = require("../models/magazine");
const multer = require("multer");

let savePdf = (req, magazine) => {
  let { originalname, filename } = req.files.digitalMagazine[0];
  let originalName = path.basename(originalname, ".pdf");
  const url = `/upload/files/${filename}`;
  magazine.magazineTitle = originalName;
  magazine.magazineUrl = url;
};

let uploadToCloudinaryAndSave = async (req, res, magazine, next) => {
  const { path: fileImgPath, filename } = req.files.coverImage[0];
  let imageObj = null;
  try {
    const fileExtName = path.extname(filename);
    const uniqueFileName = path.basename(filename, fileExtName);
    imageObj = await cloudinary.v2.uploader.upload(fileImgPath, {
      public_id: uniqueFileName,
      folder: "file-bunker",
      tags: "blog",
    });
    fileCheck(fileImgPath);
    magazine.coverImage[0].url = imageObj.url;
    magazine.coverImage[0].publicId = imageObj.public_id;
  } catch (error) {
    console.log(error);
    if (imageObj === null) {
      throw new Error(
        "unable to upload file to cloud storage check your internet"
      );
    }
  }
};

const deletePdf = (filePath) => {
  const fullpath = path.join("public", filePath);
  fs.unlink(fullpath, (err) => {
    if (err) throw err;
    console.log("path/file.txt was deleted");
  });
};

let basicGetRequestPresets = (req, res, view, mag, hasError = false) => {
  let params = {};
  params.layout = "layouts/dashboard";
  (params.magazines = mag), (params.magazine = mag);
  if (hasError) {
    params.valError = hasError;
    if (req.files.coverImage != null && req.files.coverImage != "") {
      const { path: imgFilePath } = req.files.coverImage[0];
      fileCheck(imgFilePath);
    }
    if (req.files.digitalMagazine != null && req.files.digitalMagazine != "") {
      let { path: magFilePath } = req.files.digitalMagazine[0];
      fileCheck(magFilePath);
    }
  }
  res.render(`admin/magazine/${view}`, params);
};

let validationRules = () => {
  return [
    body("author", "Invalid Author name")
      .exists()
      .isLength({ min: 1 })
      .trim()
      .escape(),
    body("snippet", "Name must have more than 5 characters")
      .exists()
      .isLength({ min: 5 })
      .trim()
      .escape(),
    body("issue", "Your issue must be at least 5 characters")
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .trim()
      .escape(),
    body("status", "blog status should be private or public")
      .optional()
      .isIn(["private", "public"]),
  ];
};

const validate = (view) => {
  return async (req, res, next) => {
    const { author, snippet, issue, status } = req.body;
    let magazine;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const extractedErrors = [];
        errors.array().map((err) => extractedErrors.push({ msg: err.msg }));
        const magazine =
          (await Magazine.findById(req.params.id)) || new Magazine({});
        magazine.issue = issue;
        magazine.snippet = snippet;
        magazine.author = author;
        magazine.status = status;

        if (req.files.coverImage != null && req.files.coverImage != "") {
          const { path: imgFilePath } = req.files.coverImage[0];
          fileCheck(imgFilePath);
        }
        if (
          req.files.digitalMagazine != null &&
          req.files.digitalMagazine != ""
        ) {
          let { path: magFilePath } = req.files.digitalMagazine[0];
          fileCheck(magFilePath);
        }
        basicGetRequestPresets(req, res, view, magazine, extractedErrors);
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
    const mag = (await Magazine.findById(req.params.id)) || new Magazine({});
    if (err instanceof multer.MulterError) {
      const errMsg = returnErrMsg(`${err.code} of ${err.field} field`);
      return basicGetRequestPresets(req, res, view, mag, errMsg);
    } else if (req.fileValidationError) {
      const errMsg = returnErrMsg(req.fileValidationError);
      return basicGetRequestPresets(req, res, view, mag, errMsg);
    } else {
      if (req.method === "POST") {
        POSTVal(req, res, next, view, mag);
      } else {
        next();
      }
    }
  } catch (error) {
    console.log(error);
  }
};
const POSTVal = (req, res, next, view, mag) => {
  if (!req.files.coverImage) {
    const errMsg = returnErrMsg("upload a cover Image");
    return basicGetRequestPresets(req, res, view, mag, errMsg);
  } else if (!req.files.digitalMagazine) {
    const errMsg = returnErrMsg("upload a Magazine");
    return basicGetRequestPresets(req, res, view, mag, errMsg);
  } else {
    next();
  }
};

module.exports = {
  savePdf,
  uploadToCloudinaryAndSave,
  deletePdf,
  basicGetRequestPresets,
  validationRules,
  validate,
  returnErrMsg,
  multerValidation,
};
