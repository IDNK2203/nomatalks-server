// load env variables
const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/config/config.env` });

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: `${__dirname}/config/dist.env` });
}

var createError = require("http-errors");
var express = require("express");
var path = require("path");
// var cookieParser = require("cookie-parser");
var logger = require("morgan");
const methodOverride = require("method-override");
const ejsLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const mongoStore = require("connect-mongo")(session);
var flash = require("connect-flash");

// setup express app
const app = express();

// connect to db
require("./config/db")();

//load other config files
require("./config/passport");
// setup server

// application routes
var indexRouter = require("./routes/index");
var magazineRouter = require("./routes/magazine");
var adminMagazineRouter = require("./routes/adminMagazine");
var adminBlogRouter = require("./routes/adminBlog");
var blogRouter = require("./routes/blog");
var authRouter = require("./routes/auth");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(ejsLayouts);
app.set("layout", "layouts/main");

// boilerplate middleware
app.use(methodOverride("_method"));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// primary middlewares

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    store: new mongoStore({
      mongooseConnection: mongoose.connection,
      collection: "session",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error = req.flash("error");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.user = req.user;
  // console.log(res.locals.user, req.user);
  next();
});

app.use("/", indexRouter);
app.use("/admin/magazine", adminMagazineRouter);
app.use("/magazine", magazineRouter);
app.use("/admin/blog", adminBlogRouter);
app.use("/blog", blogRouter);
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
