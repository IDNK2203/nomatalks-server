const cloudinary = require("cloudinary");
const path = require("path");
const fs = require("fs");

let savePdf = (req, magazine) => {
  let { originalname, filename } = req.files.digitalMagazine[0];
  let originalName = path.basename(originalname, ".pdf");
  const url = `/upload/files/${filename}`;
  magazine.magazineTitle = originalName;
  magazine.magazineUrl = url;
};

let uploadToCloudinaryAndSave = async (req, magazine) => {
  try {
    const { path: filePath, filename } = req.files.coverImage[0];
    const fileExtName = path.extname(filename);
    const uniqueFileName = path.basename(filename, fileExtName);

    const imageObj = await cloudinary.v2.uploader.upload(filePath, {
      public_id: uniqueFileName,
      folder: "file-bunker",
      tags: "blog",
    });
    magazine.coverImage[0].url = imageObj.url;
    magazine.coverImage[0].publicId = imageObj.public_id;
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(error);
  }
};

const deleteFromCloudinary = (publicId) => {
  cloudinary.v2.api.delete_resources([publicId], function (error, result) {
    console.log(result, error);
  });
};

const deletePdf = (filePath) => {
  const fullpath = path.join("public", filePath);
  fs.unlinkSync(fullpath);
};

module.exports = {
  savePdf,
  uploadToCloudinaryAndSave,
  deleteFromCloudinary,
  deletePdf,
};
