const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const path = require("path");
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const app = express();

var store = new MySQLStore({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "node-products"
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  if(!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use(routes);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

sequelize
  .sync()
  /*.then(() => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ email: "imran@hotmail.com", password: "imranbudala" });
    }
    return user;
  })
  .then((user) => {
    return user
      .getCart()
      .then((cart) => {
        if (!cart) {
          return user.createCart();
        }
        return user.getCart();
      })
      .catch((err) => {
        console.log(error);
      });
  })*/
  .then(() => {
    app.listen(3000, () => {
      console.log("server started");
    });
  })
  .catch((err) => {
    console.log(err);
  });
