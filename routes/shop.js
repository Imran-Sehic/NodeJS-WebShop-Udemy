const express = require("express");
const router = express.Router();
const path = require("path");
const rootPath = require("../util/path");
const Product = require("../models/product");
const User = require("../models/user");
const Cart = require("../models/cart");

router.get("/", (req, res, next) => {
  Product.findAll()
    .then((prods) => {
      res.render("shop", {
        products: prods,
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/buy-product", (req, res, next) => {
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: req.body.id } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        const oldQty = product.cartItem.quantity;
        newQuantity = oldQty + 1;
        return product;
      }
      return Product.findByPk(req.body.id);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/cart", (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      res.render("cart", {
        products: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/delete-product", (req, res, next) => {
  let userCart;
  req.user
    .getCart()
    .then((cart) => {
      userCart = cart;
      return cart.getProducts({ where: { id: req.body.id } });
    })
    .then((product) => {
      return userCart.removeProduct(product);
    })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
