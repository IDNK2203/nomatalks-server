const express = require("express");
const router = express.Router();
const catControllers = require("../controllers/catControllers");
const { authCheck, adminCheck } = require("../controllers/auth");

router.use(authCheck, adminCheck);

// @VIEW ROUTES
router.get("/create", catControllers.createCatView);

router.get("/edit/:id", catControllers.editCatView);

router.get("/", catControllers.getAllCatView);

// @API ROUTES
router.post("/", catControllers.createCat);

router.delete("/:id", catControllers.deleteCat);

router.put("/:id", catControllers.updateCat);

module.exports = router;
