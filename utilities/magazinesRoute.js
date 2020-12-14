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
    const { path: filePath, originalname } = req.files.coverImage[0];
    const fileExtName = path.extname(originalname);
    const uniqueFileName = path.basename(originalname, fileExtName);

    const imageObj = await cloudinary.v2.uploader.upload(filePath, {
      public_id: uniqueFileName,
      folder: "file-bunker",
      tags: "blog",
    });
    magazine.coverImage = imageObj.url;
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  savePdf,
  uploadToCloudinaryAndSave,
};
