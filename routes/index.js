var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/magazine");
});

router.get("/dashboard", function (req, res, next) {
  res.render("dashb0ard");
});

module.exports = router;
