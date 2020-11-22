const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get("/add-products", isAuth, (req, res, next) => {
  res.render("add-product");
});

router.get("/products", isAuth, (req, res, next) => {
  req.user
    .getProducts({where: {userId: req.user.id}})
    .then(products => {
      res.render('adminProducts', {
        products: products
      })
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/products", isAuth, (req, res, next) => {
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
