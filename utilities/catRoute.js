const { body, validationResult, matchedData } = require("express-validator");
const Category = require("../models/category");

let basicGetRequestPresets = (req, res, view, category, hasError = false) => {
  let params = {};
  params.layout = "layouts/dashboard";
  (params.categories = category), (params.category = category);
  if (hasError) {
    params.valError = hasError;
  }
  res.render(`admin/category/${view}`, params);
};

let validationRules = () => {
  return [
    body("name", "Invalid category name").exists().isLength({ min: 1 }).trim(),
    body("status", "Invalid category status")
      .exists()
      .isIn(["primary", "secondary"])
      .trim(),
  ];
};

const validate = (view) => {
  return async (req, res, next) => {
    try {
      let cate;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const extractedErrors = [];
        errors.array().map((err) => extractedErrors.push({ msg: err.msg }));
        if (view === "create") {
          cate = new Category({});
        } else {
          cate = await Category.findById(req.params.id);
        }
        cate.name = req.body.name;
        cate.status = req.body.status;
        basicGetRequestPresets(req, res, view, cate, extractedErrors);
      } else {
        const allData = matchedData(req);
        req.newBody = allData;
        next();
      }
    } catch (error) {
      console.log(error);
    }
  };
};

module.exports = {
  basicGetRequestPresets,
  validationRules,
  validate,
};
