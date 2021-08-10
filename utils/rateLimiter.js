const AppError = require("./appError");

// login routes
const rateLimit = require("express-rate-limit");
var MongoStore = require("rate-limit-mongo");

const rlErrOpts = {
  message:
    "Too many request are coming from this account wait a while before you can make another request.",
  statusCode: 429,
};
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 20,
  handler: function (req, res, next) {
    next(new AppError(rlErrOpts.message, rlErrOpts.statusCode));
  },
  store: new MongoStore({
    uri: process.env.DATABASEURL || "mongodb://localhost:27017/file-bunker",
    expireTimeMs: 60 * 60 * 1000,
  }),
});

module.exports = {
  authLimiter,
};
