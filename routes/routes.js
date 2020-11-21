const express = require("express");
const router = express.Router();
const adminData = require("./admin");
const shopRoutes = require("./shop");
const authRoutes = require("./auth");
const path = require("path");
const rootPath = require("../util/path");

router.use("/admin", adminData.routes);
router.use(shopRoutes);
router.use(authRoutes);

router.use((req, res, next) => {
  res.status(404).render("404");
});

module.exports = router;
