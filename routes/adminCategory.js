const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const BlogPost = require("../models/blogPost");
// utilities
const {
  basicGetRequestPresets,
  validationRules,
  validate,
} = require("../utilities/catRoute");
// utilities
const { returnErrMsg } = require("../utilities/globalUtils");
const { authCheck, adminCheck } = require("../utilities/auth");
const { Error } = require("mongoose");

router.use(authCheck, adminCheck);

router.get("/create", async (req, res) => {
  basicGetRequestPresets(req, res, "create", new Category({}));
});

router.post("/", validationRules(), validate("create"), async (req, res) => {
  let newCate;
  try {
    const { name } = req.newBody;
    let category = new Category({
      name: name,
    });
    newCate = await category.save();
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
    let errMsg;
    errMsg = returnErrMsg(error);
    basicGetRequestPresets(req, res, "create", new Category({}), errMsg);
  }
});

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    basicGetRequestPresets(req, res, "index", categories);
  } catch (error) {
    console.log(error);
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);
    basicGetRequestPresets(req, res, "edit", category);
  } catch (error) {
    res.redirect("/admin/category");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);
    await category.remove();
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
    req.flash("error_msg", error.message);
    res.redirect("/admin/category");
  }
});

router.put("/:id", validationRules(), validate("edit"), async (req, res) => {
  let newCate;
  let category;
  try {
    const { name } = req.newBody;
    category = await Category.findById(req.params.id);
    console.log(req.params.id);
    console.log(Category);
    category.name = name;
    newCate = await category.save();
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
    let errMsg;
    errMsg = returnErrMsg(error);
    basicGetRequestPresets(req, res, "edit", category, errMsg);
  }
});

module.exports = router;
