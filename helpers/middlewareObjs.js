// load env variables
const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/../config/config.env` });
const helmet = require("helmet");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoStore = require("connect-mongo")(session);

exports.helmetConfig = {
  directives: {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    "script-src": [
      "'self'",
      "https://cdn.jsdelivr.net/",
      "https://code.jquery.com/",
      "https://cdn.tiny.cloud/",
      "https://platform.twitter.com/",
      "'nonce-78377b525757b494427f89014f97d79928f3938d14eb51e20fb5dec9834eb304'",
      "'nonce-wCCPXBRBeiNWrmLRTpJiufiiisncADVgshd'",
      "'nonce-NniaIoDmeHdcisgCvYgxdjnIkdDWdtsduJNasHxcapdccjSdfX'",
      "'nonce-thsladAKndkjnAMNIcvnknvAdwqgnjgpKSNKJNdvnxswzmb'",
      "https://connect.facebook.net/",
      "https://www.googletagmanager.com/",
    ],

    "img-src": [
      "'self'",
      "https://res.cloudinary.com/",
      "https://sp.tinymce.com/",
      "https://syndication.twitter.com/",
      "https://www.google-analytics.com/",
      "https://cdn.viglink.com/images/",

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
};

exports.SessionObj = {
  secret: process.env.SESSION_SECRET,
  // look up sessions object config properly
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
