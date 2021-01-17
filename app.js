// load env variables
const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/config/config.env` });

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  process.exit(1);
});

process.env.NODE_ENV = "production";

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

// errors
const AppError = require("./helpers/appError");
const errorMdw = require("./helpers/errorMdw");

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
const adminCategoryRouter = require("./routes/adminCategory");

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

const { formatDate } = require("./helpers/locals");

app.use((req, res, next) => {
  // errors
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error = req.flash("error");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.user = req.user;
  res.locals.formatDate = formatDate;
  // console.log(res.locals.user, req.user);
  next();
});

app.use("/", indexRouter);
app.use("/admin/magazine", adminMagazineRouter);
app.use("/magazine", magazineRouter);
app.use("/admin/blog", adminBlogRouter);
app.use("/blog", blogRouter);
app.use("/auth", authRouter);
app.use("/admin/category", adminCategoryRouter);

// catch 404 and forward to error handler
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handler
app.use(errorMdw);

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  process.exit(1);
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
