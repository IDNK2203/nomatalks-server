var express = require("express");
var router = express.Router();
const { authCheck, adminCheck } = require("../utilities/auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/magazine");
});

router.get("/dashboard", authCheck, function (req, res, next) {
  res.render("admin/index", { user: req.user, layout: "layouts/dashboard" });
});

module.exports = router;
