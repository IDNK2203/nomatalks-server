const express = require("express");
const Magazine = require("../models/magazine");
const router = express.Router();

router.get("/", async (req, res) => {
  let query = Magazine.find();
  if (req.query.magIssue != null && req.query.magIssue != "") {
    query.regex("issue", new RegExp(req.query.magIssue, "i")).limit(10);
  }
  try {
    const magazines = await query
      .sort({ createdAt: "desc" })
      .where("status")
      .equals("public")
      .exec();

    let searchOpts = req.query;
    res.render("magazine/index", { magazines, searchOpts });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:slug", async (req, res) => {
  try {
    // const id = req.params.slug;
    const magazine = await Magazine.findOne({ slug: req.params.slug })
      .where("status")
      .equals("public")
      .exec();
    res.render("magazine/show", { magazine });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
