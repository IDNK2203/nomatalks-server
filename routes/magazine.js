const express = require("express");
const Magazine = require("../models/magazine");
const router = express.Router();

router.get("/", async (req, res) => {
  let query = Magazine.find();
  if (req.query.magIssue != null && req.query.magIssue != "") {
    query.regex("issue", new RegExp(req.query.magIssue, "i")).limit(10);
  }
  try {
    const magazines = await query.sort({ createdAt: "desc" }).exec();
    let searchOpts = req.query;
    res.render("index", { magazines, searchOpts });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const magazine = await Magazine.findById(id);
    res.render("show", { magazine });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
