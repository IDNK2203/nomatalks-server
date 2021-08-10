const AppError = require("../utils/appError");

const sendDevErrors = (err, res) => {
  res.status(err.statusCode).render("error", {
    layout: "layouts/error",
    title: "Error page",
    status: err.status,
    message: err.message,
    statusCode: err.statusCode,
  });
};

const ProdSrrErr = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      layout: "layouts/error",
      pageTitle: "Error Page",
      status: err.status,
      message: err.message,
      statusCode: err.statusCode,
    });
  }
  res.status(500).render("error", {
    layout: "layouts/error",
    pageTitle: "Error Page",
    status: "Error",
    message: "Unknown error occured",
    statusCode: err.statusCode,
  });
};

const sendProdErrors = (err, req, res) => {
  ProdSrrErr(err, req, res);
};

module.exports = (err, req, res, next) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === "production") {
    let error = JSON.parse(JSON.stringify(err));
    error.message = err.message;
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    sendProdErrors(error, res);
  } else {
    sendDevErrors(err, res);
  }
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
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
