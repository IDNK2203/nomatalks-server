const bcrypt = require("bcryptjs");

const passwordGen = async (plainTextPasword, saltRounds) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plainTextPasword, salt);
    return hash;
  } catch (error) {
    console.log(error);
    // return error;
  }
};
const isPasswordValid = async (user, plainTextPasword) => {
  try {
    const match = await bcrypt.compare(plainTextPasword, user.password);
    return match;
  } catch (error) {
    console.log(error);
    // return error;
  }
};

module.exports = {
  isPasswordValid,
  passwordGen,
};
