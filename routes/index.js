var express = require("express");
var router = express.Router();
const { authCheck, adminCheck } = require("../utilities/auth");
const Category = require("../models/category");

const getCategories = (status) => {
  return Category.find().where("status").equals(status);
};

router.get("/dashboard", adminCheck, function (req, res, next) {
  res.render("admin/index", { user: req.user, layout: "layouts/dashboard" });
});

router.get("/about", async function (req, res, next) {
  try {
    const navCategories = await getCategories("primary");
    const subNavCategories = await getCategories("secondary");
    const pageTitle = "About Us";
    res.render("about", {
      navCategories,
      subNavCategories,
      pageTitle,
      searchOpts: req.query,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/policy", async function (req, res, next) {
  try {
    const navCategories = await getCategories("primary");
    const subNavCategories = await getCategories("secondary");
    const pageTitle = "Privacy Policy";
    res.render("policy", {
      navCategories,
      subNavCategories,
      pageTitle,
      searchOpts: req.query,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/contact-us", async function (req, res, next) {
  try {
    const navCategories = await getCategories("primary");
    const subNavCategories = await getCategories("secondary");
    const pageTitle = "Contact Us";
    res.render("contact", {
      navCategories,
      subNavCategories,
      pageTitle,
      searchOpts: req.query,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
