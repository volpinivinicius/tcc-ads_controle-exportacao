require("dotenv").config();

const mongoose = require("mongoose");
const dbConnect = require("../config/dbConnect");
const { seedSystemPermissions } = require("./systemPermissions");
const { bootstrapAdmin } = require("./bootstrapAdmin");

dbConnect()
  .then(() => seedSystemPermissions())
  .then(() => bootstrapAdmin())
  .then(() => mongoose.disconnect())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });