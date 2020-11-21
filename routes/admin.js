const express = require("express");
const router = express.Router();

router.get("/add-products", (req, res, next) => {
  res.render("add-product");
});

router.get("/products", (req, res, next) => {
  req.user
    .getProducts()
    .then(products => {
      res.render('adminProducts', {
        products: products
      })
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/products", (req, res, next) => {
  req.user
    .createProduct({
      title: req.body.title,
      price: req.body.price,
      imageUrl: req.body.imageUrl,
      description: req.body.description,
    })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

exports.routes = router;
