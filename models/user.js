const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      default: Date.now,
    },
  },
  { timestamps: true }
);
const User = mongoose.model("user", userSchema);
module.exports = User;
