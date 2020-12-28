const mongoose = require("mongoose");

const connect = async () => {
  try {
    const connectValue = await mongoose.connect(
      process.env.DATABASEURL || "mongodb://localhost/file-bunker",
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: true,
      }
    );
    console.log(`MONGODB CONNECTED:${connectValue.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connect;
