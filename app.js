// load env variables
const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/config/config.env` });

// process.env.NODE_ENV = "production";

var express = require("express");
const compression = require("compression");
var path = require("path");
var logger = require("morgan");
const methodOverride = require("method-override");
const ejsLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const session = require("express-session");
const mongoStore = require("connect-mongo")(session);
var flash = require("connect-flash");

// errors
const AppError = require("./helpers/appError");
const errorMdw = require("./helpers/errorMdw");

// setup express app
const app = express();

if (app.get("env") === "production") {
  process.on("uncaughtException", (err) => {
    console.log(err.name, err.message);
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    process.exit(1);
  });
}
// connect to db
require("./config/db")();

//load other config files
require("./config/passport");

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
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": [
        "'self'",
        "https://cdn.jsdelivr.net/",
        "https://code.jquery.com/",
        "https://unpkg.com/",
        "https://cdn.tiny.cloud/",
        "https://platform.twitter.com/",
        "'nonce-78377b525757b494427f89014f97d79928f3938d14eb51e20fb5dec9834eb304'",
        "'nonce-79F68BC4D3D999914A98BEEF7EFCC'",
        "https://connect.facebook.net/",
        "https://www.googletagmanager.com/",
      ],

      "img-src": [
        "'self'",
        "https://res.cloudinary.com/",
        "https://sp.tinymce.com/",
        "https://syndication.twitter.com/",
        "data:",
      ],
      "default-src": [
        "'self'",
        "https://platform.twitter.com/",
        "https://www.google-analytics.com/",
        "https://web.facebook.com/",
        "https://www.facebook.com/",
      ],
      "object-src": ["'none'"],
    },
  })
);

// primary middlewares
let sessObj = {
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: false,
  store: new mongoStore({
    mongooseConnection: mongoose.connection,
    collection: "session",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: true,
  },
};
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessObj.cookie.secure = true; // serve secure cookies
}
app.use(session(sessObj));

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
  next();
});

app.use("/", indexRouter);
app.use("/", blogRouter);
app.use("/auth", authRouter);
app.use("/magazine", magazineRouter);
app.use("/admin/magazine", adminMagazineRouter);
app.use("/admin/blog", adminBlogRouter);
app.use("/admin/category", adminCategoryRouter);

// catch 404 and forward to error handler
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handler
app.use(errorMdw);

if (app.get("env") === "production") {
  process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    process.exit(1);
  });
}

app.listen(process.env.PORT || 3000, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
