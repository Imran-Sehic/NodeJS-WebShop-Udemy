const express = require("express");
const router = express.Router();
const path = require("path");
const rootPath = require("../util/path");
const isAuth = require("../middleware/is-auth");
const Product = require("../models/product");
const User = require("../models/user");
const Cart = require("../models/cart");

router.get("/", (req, res, next) => {
  Product.findAll()
    .then((prods) => {
      res.render("shop", {
        products: prods,
      });
    })
    .catch((err) => {
      return next(new Error(err));
    });
});

router.post("/buy-product", isAuth, (req, res, next) => {
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
      return next(new Error(err));
    });
});

router.get("/cart", isAuth, (req, res, next) => {
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
      return next(new Error(err));
    });
});

router.post("/delete-product", isAuth, (req, res, next) => {
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
      return next(new Error(err));
    });
});

router.get("/order", isAuth, (req, res, next) => {
  let totalPrice = 0;
  let totalItems = 0;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      products.forEach(prod => {
        totalPrice += prod.cartItem.quantity * prod.price;
        totalItems += prod.cartItem.quantity;
      })
      res.render("order", {
        totalPrice: totalPrice,
        totalItems: totalItems,
        products: products
      })
    })
    .catch((err) => {
      return next(new Error(err));
    });
});

module.exports = router;
