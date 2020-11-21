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
const csrf = require("csurf");
const flash = require("connect-flash");
const MySQLStore = require("express-mysql-session")(session);

const app = express();

var store = new MySQLStore({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "node-products"
});

const csrfProtection = csrf();

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

app.use(csrfProtection);
app.use(flash());

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

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use(routes);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log("server started");
    });
  })
  .catch((err) => {
    console.log(err);
  });
