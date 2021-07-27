// const { body, validationResult, matchedData } = require("express-validator");
const Category = require("../models/category");
const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/appError");

let basicGetRequestPresets = (req, res, view, category, hasError = false) => {
  let params = {};
  params.layout = "layouts/dashboard";
  (params.categories = category), (params.category = category);
  if (hasError) {
    params.valError = hasError;
  }
  res.render(`admin/category/${view}`, params);
};

const validate = (req, res, err, view) => {
  let errArray = [];
  for (e in err.errors) {
    errArray.push({ msg: err.errors[e].message });
  }
  if (view === "create") {
    basicGetRequestPresets(req, res, view, new Category({}), errArray);
  } else {
    basicGetRequestPresets(req, res, view, req.body, errArray);
  }
};

// // VIEW CONTROLLERS
exports.showNewCategory = (req, res, next) => {
  basicGetRequestPresets(req, res, "create", new Category({}));
};

exports.showAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();
  basicGetRequestPresets(req, res, "index", categories);
});

exports.showEditCategories = catchAsync(async (req, res, next) => {
  let cat = await Category.findById(req.params.id);
  if (!cat) {
    return new AppError("There is no document with this ID.");
  }
  basicGetRequestPresets(req, res, "edit", cat);
});

// API CONTROLLER

exports.createCat = async (req, res, next) => {
  try {
    await Category.create(req.body);
    res.redirect("/admin/category");
  } catch (err) {
    if (err._message === "category validation failed") {
      return validate(req, res, err, "create");
    }
    return next(err);
  }
};

exports.deleteCat = catchAsync(async (req, res, next) => {
  let cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) {
    return next(new AppError("There is no document with this ID."));
  }
  res.redirect("/admin/category");
});

exports.updateCat = async (req, res, next) => {
  try {
    let cat = await Category.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    if (!cat) {
      return next(new AppError("There is no document with this ID."));
    }
    res.redirect("/admin/category");
  } catch (err) {
    if (
      err._message === "category validation failed" ||
      err._message === "Validation failed"
    ) {
      return validate(req, res, err, "edit");
    }
    return next(err);
  }
};
