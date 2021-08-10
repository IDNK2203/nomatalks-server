const mongoose = require("mongoose");
const Category = require("./models/category");

const connect = async () => {
  try {
    const connectValue = await mongoose.connect(
      process.env.DATABASEURL || "mongodb://localhost:27017/file-bunker",
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }
    );
    console.log(`MONGODB CONNECTED:${connectValue.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

connect();

const updateDoc = async () => {
  try {
    const doc = await Category.updateMany({}, { version: 1 });
    console.log(doc);
  } catch (error) {
    console.log(error);
  }
};

updateDoc();
