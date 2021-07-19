const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const User = require("../models/user");
const { isPasswordValid } = require("../controllers/password");

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.log("error");
    done(error);
  }
});

const verifyCallback = async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return done(null, false, { message: "Incorrect email." });
    }
    const match = await isPasswordValid(user, password);
    if (!match) {
      return done(null, false, { message: "Incorrect password." });
    }
    console.log(user);
    return done(null, user);
  } catch (error) {
    console.log(error);
    done(error);
  }
};

const customFields = {
  usernameField: "email",
  passwordField: "password",
};
const strategy = new passportLocal(customFields, verifyCallback);

passport.use(strategy);
