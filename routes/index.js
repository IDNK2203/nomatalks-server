var express = require("express");
var router = express.Router();
const { authCheck, adminCheck } = require("../utilities/auth");

router.get("/dashboard", authCheck, adminCheck, function (req, res, next) {
  res.render("admin/index", { user: req.user, layout: "layouts/dashboard" });
});

module.exports = router;
