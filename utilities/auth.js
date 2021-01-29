const { body, validationResult, matchedData } = require("express-validator");
var csrf = require("csurf");
let authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("error_msg", "you have to log in to view this resource");
    res.redirect("/auth/login");
  }
};
let adminCheck = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin) {
    next();
  } else {
    req.flash("error_msg", "You are not authorized to view this resource");
    res.redirect("/magazine");
  }
};

let validationRules = () => {
  return [
    body("email", "Your email is not valid")
      .not()
      .isEmpty()
      .isEmail()
      .normalizeEmail()
      .trim()
      .escape(),
    body("name", "Name must have more than 5 characters")
      .exists()
      .isLength({ min: 5 })
      .trim()
      .escape(),
    body("password", "Your password must be at least 5 characters")
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .trim()
      .escape(),
    body("password2", "Passwords do not match")
      .custom((value, { req }) => value === req.body.password)
      .trim()
      .escape(),
  ];
};
const validate = (req, res, next) => {
  const { name, password, email, password2 } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ msg: err.msg }));
    res.render("auth/register", {
      name,
      email,
      password,
      password2,
      valError: extractedErrors,
      layout: "layouts/auth",
      csrfToken: req.csrfToken(),
    });
  } else {
    const allData = matchedData(req);
    req.newBody = allData;
    next();
  }
};

module.exports = {
  authCheck,
  adminCheck,
  validationRules,
  validate,
};
