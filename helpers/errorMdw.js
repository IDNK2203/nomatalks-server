const AppError = require("../helpers/appError");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500);
  res.render("error", { layout: "layouts/error" });
};

const sendErrorProd = (err, res) => {
  err.stack = null;
  res.status(err.statusCode || 500);
  res.render("error", {
    layout: "layouts/error",
    pageTitle: "Error Page",
  });
};

module.exports = (err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.status = err.status || "error";
  res.locals.statusCode = err.statusCode || 500;
  res.locals.error = err;
  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (error.statusCode == 404) {
      res.status(err.statusCode || 500);
      return res.render("404", {
        layout: "layouts/error",
        pageTitle: "404 Page",
      });
    }
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  } else {
    sendErrorDev(err, res);
  }
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
