const multer = require("multer");
const path = require("path");

// const pdfMimeTypes = ["application/pdf"];
const fileMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];
const pdfFileMimeTypes = ["application/pdf"];
const imageFileMimeTypes = ["image/jpeg", "image/png", "image/gif"];

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
      path.basename(file.originalname, path.extname(file.originalname)) +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.fieldname == "digitalMagazine" &&
      pdfFileMimeTypes.includes(file.mimetype)
    ) {
      cb(null, true);
    } else if (
      (file.fieldname == "coverImage" || file.fieldname == "blogPostCI") &&
      imageFileMimeTypes.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      req.fileValidationError = `wrong file format at ${file.fieldname}`;
      cb(null, false);
    }
  },

  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const multiUpload = upload.fields([
  { name: "digitalMagazine" },
  { name: "coverImage" },
  { name: "blogPostCI" },
]);

module.exports = multiUpload;
