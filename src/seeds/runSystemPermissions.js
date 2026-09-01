require("dotenv").config();
 
const mongoose = require("mongoose");
const dbConnect = require("../config/dbConnect");
const { seedSystemPermissions } = require("./systemPermissions");
 
dbConnect().then(async () => {
  await seedSystemPermissions();
  await mongoose.disconnect();
  process.exit(0);
});