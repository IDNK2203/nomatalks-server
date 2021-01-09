const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { passwordGen } = require("../utilities/password");
const { validationRules, validate } = require("../utilities/auth");

// login routes

router.post(
  "/register",
  validationRules(),
  validate,
  async (req, res, next) => {
    const { name, password, email, password2 } = req.newBody;
    let error = [];
    try {
      const user = await User.findOne({ email: email });
      if (user) {
        error.push({ msg: "email is already registered" });
        res.render("register", {
          name,
          email,
          password,
          password2,
          valError: error,
          layout: "layouts/auth",
        });
      } else {
        let newUser = new User({
          name,
          email,
        });
        const paswordHash = await passwordGen(password, 10);
        newUser.password = paswordHash;
        await newUser.save();
        req.flash("success_msg", "you are now resgistered you can login ");
        res.redirect("/auth/login");
      }
    } catch (error) {
      console.log(error);
    }
  }
);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

router.get("/logout", (req, res, next) => {
  req.logout();
  req.flash("success_msg", "you have been logged out");
  res.redirect("/");
});
// register routes
router.get("/register", (req, res, next) => {
  res.render("auth/register", { layout: "layouts/auth" });
});
router.get("/login", (req, res, next) => {
  res.render("auth/login", { layout: "layouts/auth" });
});

module.exports = router;
