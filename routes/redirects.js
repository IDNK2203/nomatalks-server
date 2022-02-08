const Router = require("express").Router();

Router.get("page/1/", (req, res, next) => {
  res.redirect("/");
});
Router.get("/category/page/1?category=inspired", (req, res, next) => {
  res.redirect("/category/inspired");
});
Router.get("/category/page/1?category=stories", (req, res, next) => {
  res.redirect("/category/stories");
});

module.exports = Router;
