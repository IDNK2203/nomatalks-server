const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { passwordGen } = require("../utilities/password");

// login routes
router.post("/register", (req, res, next) => {
  const { name, password, email, password2 } = req.body;
  // console.log(req.body);
  // handle form validation
  let error = [];
  if (!name || !email || !password || !password2) {
    error.push({ msg: "fill all input fields" });
  }
  if (password !== password2) {
    error.push({ msg: "passwords do not match" });
  }
  if (password.length < 3) {
    error.push({ msg: "password should be at least 6 characters" });
  }
  console.log(error);
  if (error.length > 0) {
    res.render("register", {
      name,
      email,
      password,
      password2,
      valError: error,
    });
  } else {
    // check if user exists
    User.findOne({ email: email }).then((user) => {
      if (user) {
        error.push({ msg: "email is already registered" });
        res.render("register", {
          name,
          email,
          password,
          password2,
          valError: error,
        });
      } else {
        // create a new user
        let newUser = new User({
          name,
          email,
        });
        passwordGen(password, 10)
          .then((paswordHash) => {
            newUser.password = paswordHash;
            newUser.save();
            req.flash("success_msg", "you are now resgistered you can login ");
            res.redirect("/auth/login");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  }),
  (req, res, next) => {}
);

router.get("/logout", (req, res, next) => {
  req.logout();
  req.flash("success_msg", "you have been logged out");
  res.redirect("/");
});
// register routes
router.get("/register", (req, res, next) => {
  res.render("register");
});
router.get("/login", (req, res, next) => {
  res.render("login");
});

module.exports = router;
