const mongoose = require("mongoose");

const connect = async () => {
  try {
    const connectValue = await mongoose.connect(
      "mongodb://localhost/file-bunker",
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: true,
      }
    );
    console.log(connectValue.connection.host);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connect;
