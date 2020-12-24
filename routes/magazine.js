const express = require("express");
const Magazine = require("../models/magazine");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const magazines = await Magazine.find();
    res.render("index", { magazines: magazines });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const magazine = await Magazine.findById(id);
    // const magazines = await Magazine.find();
    res.render("show", { magazine: magazine });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
