var express = require("express");
const fs = require("fs");
const path = require("path");
var router = express.Router();

const filespath = path.join("public", "files");

// const pdfFiles = fs.readdir(filespath, (err, files) => {
//   if (err) console.log(err);
//   else {
//     files.map((file) => {
//       return {
//         name: path.basename(file, ".pdf"),
//         url: `/files/${file}`,
//       };
//     });
//   }
// });
// .then((files) => console.log(files));
/* GET users listing. */
router.get("/", async function (req, res, next) {
  try {
    const pdfFiles = fs.readdirSync(filespath).map((file) => {
      return {
        name: path.basename(file, ".pdf"),
        url: `/files/${file}`,
      };
    });
    console.log(pdfFiles);
    res.render("files", { pdfFiles: pdfFiles });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
