const multer = require("multer");
const path = require("path");

// const pdfMimeTypes = ["application/pdf"];
const fileMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];
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
    cb(null, fileMimeTypes.includes(file.mimetype));
  },
  limits: {
    fileSize: 1024 * 1024 * 1,
  },
});

const multiUpload = upload.fields([
  { name: "digitalMagazine" },
  { name: "coverImage" },
]);

module.exports = multiUpload;
