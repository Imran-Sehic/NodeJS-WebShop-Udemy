const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, body, validationResult } = require("express-validator/check");
const User = require("../models/user");

router.get("/signup", (req, res, next) => {
  res.render("auth/signup", {
    error: "",
    oldInput: {
      email: "",
      password: "",
      repeatPassword: "",
    },
  });
});

router.post(
  "/signup",
  [
    body("password", "password should be at least 6 characters long!")
      .isLength({
        min: 6,
      }).trim(),
    body("repeatPassword").trim().custom((value, { req }) => {
      if (value.trim() !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
  ],
  (req, res, next) => {
    const email = req.body.email.trim();
    const password = req.body.password;
    const repeatPassword = req.body.repeatPassword;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        error: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password,
          repeatPassword: repeatPassword,
        },
      });
    }
    User.findOne({ where: { email: email } })
      .then((u) => {
        if (u) {
          return res.status(422).render("auth/signup", {
            error: "email already exists!",
            oldInput: {
              email: email,
              password: password,
              repeatPassword: repeatPassword,
            },
          });
        }
        return bcrypt
          .hash(password, 12)
          .then((hashedPassword) => {
            return User.create({
              email: email,
              password: hashedPassword,
            });
          })
          .then((user) => {
            return user.createCart();
          })
          .then(() => {
            return res.redirect("/login");
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

router.get("/login", (req, res, next) => {
  res.render("auth/login", {
    error: "",
    oldInput: {
      email: "",
      password: "",
    },
  });
});

router.post("/login", (req, res, next) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          error: "Invalid credentials!",
          oldInput: {
            email: email,
            password: password,
          },
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            error: "Invalid credentials!",
            oldInput: {
              email: email,
              password: password,
            },
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
});

module.exports = router;
