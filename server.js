require("dotenv").config();

const app = require("./src/app");
const dbConnect = require("./src/config/dbConnect");
const { seedSystemPermissions } = require("./src/seeds/systemPermissions");
const { syncSystemAdministratorPermissions } = require("./src/seeds/bootstrapAdmin");

const PORT = process.env.PORT || 3000;

dbConnect()
  .then(() => seedSystemPermissions())
  .then(() => syncSystemAdministratorPermissions())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });