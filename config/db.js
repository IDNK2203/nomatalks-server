const mongoose = require("mongoose");

const connect = async () => {
  try {
    const connectValue = await mongoose.connect(
      process.env.DATABASEURL || "mongodb://localhost:27017/file-bunker",
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: true,
        useCreateIndex: true,
      }
    );
    console.log(`MONGODB CONNECTED:${connectValue.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connect;
