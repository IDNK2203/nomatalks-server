const cloudinary = require("cloudinary");
const path = require("path");
const fs = require("fs");
const { body, validationResult, matchedData } = require("express-validator");

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
  // let { path: fileMagPath } = req.files.digitalMagazine[0];
  let imageObj = null;
  try {
    const fileExtName = path.extname(filename);
    const uniqueFileName = path.basename(filename, fileExtName);
    imageObj = await cloudinary.v2.uploader.upload(fileImgPath, {
      public_id: uniqueFileName,
      folder: "file-bunker",
      tags: "blog",
    });
    deleteFile(fileImgPath);
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
const returnErrMsg = (err) => {
  return [{ msg: err }];
};

const deleteFromCloudinary = (publicId) => {
  cloudinary.v2.api.delete_resources([publicId], function (error, result) {
    console.log(result, error);
  });
};

const deletePdf = (filePath) => {
  const fullpath = path.join("public", filePath);
  fs.unlink(fullpath, (err) => {
    if (err) throw err;
    console.log("path/file.txt was deleted");
  });
};

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
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
      // delete  IMAGE
      deleteFile(imgFilePath);
    }
    if (req.files.digitalMagazine != null && req.files.digitalMagazine != "") {
      let { path: magFilePath } = req.files.digitalMagazine[0];
      // delete PDF
      deleteFile(magFilePath);
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
  ];
};

const validate = (view) => {
  return (req, res, next) => {
    const { author, snippet, issue } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array().map((err) => extractedErrors.push({ msg: err.msg }));
      let magazine = new Magazine({
        issue: issue,
        snippet: snippet,
        author: author,
      });
      if (req.files.coverImage != null && req.files.coverImage != "") {
        const { path: imgFilePath } = req.files.coverImage[0];
        // delete  IMAGE
        deleteFile(imgFilePath);
      }
      if (
        req.files.digitalMagazine != null &&
        req.files.digitalMagazine != ""
      ) {
        let { path: magFilePath } = req.files.digitalMagazine[0];
        // delete PDF
        deleteFile(magFilePath);
      }
      basicGetRequestPresets(req, res, view, magazine, extractedErrors);
    } else {
      const allData = matchedData(req);
      req.newBody = allData;
      next();
    }
  };
};

let multerValidation_POST = (multerConfig) => {
  return async (req, res, next) => {
    multerConfig(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        const errMsg = returnErrMsg(`${err.code} of ${err.field} field`);
        basicGetRequestPresets(req, res, "create", new Magazine({}), errMsg);
      } else if (req.fileValidationError) {
        const errMsg = returnErrMsg(req.fileValidationError);
        basicGetRequestPresets(req, res, "create", new Magazine({}), errMsg);
      } else if (!req.files.coverImage) {
        const errMsg = returnErrMsg("upload a cover Image");
        basicGetRequestPresets(req, res, "create", new Magazine({}), errMsg);
      } else if (!req.files.digitalMagazine) {
        const errMsg = returnErrMsg("upload a Magazine");
        basicGetRequestPresets(req, res, "create", new Magazine({}), errMsg);
      } else {
        next();
      }
    });
  };
};

let multerValidation_PUT = (multerConfig) => {
  return async (req, res, next) => {
    multerConfig(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        const errMsg = returnErrMsg(`${err.code} of ${err.field} field`);
        basicGetRequestPresets(req, res, "edit", new Magazine({}), errMsg);
      } else if (req.fileValidationError) {
        const errMsg = returnErrMsg(req.fileValidationError);
        basicGetRequestPresets(req, res, "edit", new Magazine({}), errMsg);
      } else {
        next();
      }
    });
  };
};
module.exports = {
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
};
