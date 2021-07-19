// load env variables
const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/config/config.env` });

process.on("uncaughtException", (err) => {
  // console.log(err.name, err.message);
  console.log(err);
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  process.exit(1);
});

const app = require("./app");

// connect to db
require("./config/db")();

//load other config files
require("./config/passport");

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});

if (app.get("env") === "production") {
  process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    server.close(() => {
      process.exit(1);
    });
  });
}
