const cloudinary = require("cloudinary");
const fs = require("fs");
const { Error } = require("mongoose");
const fsPromises = fs.promises;
const returnErrMsg = (err) => {
  return [{ msg: err }];
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.v2.api.delete_resources([publicId]);
  } catch (error) {
    console.log(error);
    throw new Error(
      "CLOUDINARY_ERROR couldn't delete image from cloud storage pls check you internet"
    );
  }
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

module.exports = {
  deleteFromCloudinary,
  returnErrMsg,
  fileCheck,
};
