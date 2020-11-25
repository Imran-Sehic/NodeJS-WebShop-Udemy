const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const { body, validationResult } = require("express-validator/check");
const isAuth = require("../middleware/is-auth");
const fileHelper = require('../util/file');

router.get("/add-products", isAuth, (req, res, next) => {
  res.render("add-product", {
    error: "",
    oldInput: {
      title: "",
      price: null,
      description: "",
    },
  });
});

router.get("/products", isAuth, (req, res, next) => {
  req.user
    .getProducts({ where: { userId: req.user.id } })
    .then((products) => {
      res.render("adminProducts", {
        products: products,
      });
    })
    .catch((err) => {
      return next(new Error(err));
    });
});

router.post(
  "/products",
  isAuth,
  [
    body("title", "password should be at least 4 characters long!")
      .isLength({
        min: 4,
      })
      .trim(),
    body("price", "Enter a price please!").isLength({
      min: 1,
    }),
    body("description", "description should be at least 10 characters long!")
      .isLength({
        min: 10,
      })
      .trim(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("add-product", {
        error: errors.array()[0].msg,
        oldInput: {
          title: req.body.title,
          price: req.body.price,
          description: req.body.description,
        },
      });
    }

    if (!req.file) {
      return res.status(422).render("add-product", {
        error: "the selected file is not an image!",
        oldInput: {
          title: req.body.title,
          price: req.body.price,
          description: req.body.description,
        },
      });
    }

    req.user
      .createProduct({
        title: req.body.title,
        price: req.body.price,
        imageUrl: req.file.path,
        description: req.body.description,
      })
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        return next(new Error(err));
      });
  }
);

router.post("/delete-product", isAuth, (req, res, next) => {
  Product.findByPk(req.body.productId)
    .then(product => {
      if(!product) {
        return next(new Error('Product not found!'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.destroy({ where: { id: req.body.productId } });
    })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      next(new Error(err));
    });
});

exports.routes = router;
