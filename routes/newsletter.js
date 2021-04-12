var csrf = require("csurf");
const { body, validationResult, matchedData } = require("express-validator");
var express = require("express");
var router = express.Router();
const mailchimp = require("@mailchimp/mailchimp_marketing");
const AppError = require("../helpers/appError");

mailchimp.setConfig({
  apiKey: process.env.MC_API_KEY,
  server: process.env.MC_SERVER,
});

const listId = process.env.MC_LIST_ID;

async function sub(req, res, next) {
  try {
    const response = await mailchimp.lists.addListMember(listId, {
      email_address: req.newBody.email,
      status: "pending",
    });
    req.flash("success_msg", "please check your email now for confirmation");
    res.redirect("/");
  } catch (error) {
    return next(error);
  }
}

let validationRules = () => {
  return [
    body("email", "Your email is not valid")
      .not()
      .isEmpty()
      .isEmail()
      .normalizeEmail()
      .trim()
      .escape(),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("error_msg", "enter a valid eamil address");
    res.redirect("/#cta_banner");
  } else {
    const allData = matchedData(req);
    req.newBody = allData;
    next();
  }
};

const mcHandller = (req, res, next) => {};
router.route("/").post(validationRules(), validate, sub);
module.exports = router;
