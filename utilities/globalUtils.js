const cloudinary = require("cloudinary");
const fs = require("fs");
const fsPromises = fs.promises;
const returnErrMsg = (err) => {
  return [{ msg: err }];
};

const deleteFromCloudinary = (publicId) => {
  cloudinary.v2.api.delete_resources([publicId], function (error, result) {
    console.log(result, error);
  });
};
const fileCheck = async (filePath) => {
  try {
    const access = await fsPromises.access(filePath, fs.constants.F_OK);
    await fsPromises.unlink(filePath);
    console.log(`successfully deleted ${filePath}`);
  } catch (error) {
    console.log("file does'nt exist");
  }
};

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) throw err;
    console.log("path/file.txt was deleted");
  });
};

module.exports = {
  deleteFromCloudinary,
  returnErrMsg,
  fileCheck,
  deleteFile,
};
