// load env variables
const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/config/config.env` });

var express = require("express");
const { forceDomain } = require("forcedomain");
const compression = require("compression");
var path = require("path");
var logger = require("morgan");
const methodOverride = require("method-override");
const ejsLayouts = require("express-ejs-layouts");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const session = require("express-session");
var flash = require("connect-flash");
const middlewareObjs = require("./helpers/middlewareObjs");

// errors
const AppError = require("./helpers/appError");
const errorMdw = require("./helpers/errorMdw");

// application routes
var indexRouter = require("./routes/index");
var adminBlogRouter = require("./routes/adminBlog");
var blogRouter = require("./routes/blog");
var authRouter = require("./routes/auth");
const adminCategoryRouter = require("./routes/adminCategory");
const newslettersSub = require("./routes/newsletter");

// setup express app
const app = express();

if (app.get("env") === "production") {
  app.use(
    forceDomain({
      hostname: "thenomatalks.com",
    })
  );
}
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(ejsLayouts);
app.set("layout", "layouts/main");

// boilerplate middleware
if (app.get("env") !== "production") {
  app.use(logger("dev"));
}
app.use(compression());
app.use(methodOverride("_method"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());
app.use(cookieParser());
app.use(helmet());
app.use(helmet.contentSecurityPolicy(middlewareObjs.helmetConfig));

// primary middlewares
let sessObj = middlewareObjs.SessionObj;
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessObj.cookie.secure = true; // serve secure cookies
}

app.use(session(sessObj));

// create a flash object , with flash message . That gets stored in the session obj
app.use(flash());

app.use(passport.initialize());

// store user data in sessions object
app.use(passport.session());
const { formatDate } = require("./helpers/locals");

app.use((req, res, next) => {
  // errors
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error = req.flash("error");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.user = req.user;
  res.locals.GA_ID = process.env.GA_ID;
  res.locals.UA_ID = process.env.UA_ID;
  res.locals.formatDate = formatDate;
  next();
});

app.use("/", indexRouter);
app.use("/", blogRouter);
app.use("/auth", authRouter);
app.use("/admin/blog", adminBlogRouter);
app.use("/admin/category", adminCategoryRouter);
app.use("/subcribe", newslettersSub);

// catch 404 and forward to error handler
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handler
app.use(errorMdw);

module.exports = app;
