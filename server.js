/**
 * Server Entry Point
 *
 * Loads the environment variables, initializes the database
 * connection, and starts the Express application on the port
 * defined by the PORT environment variable.
 *
 * This is the file executed to run the application.
 */
 
require("dotenv").config();
 
const app = require("./src/app");
const dbConnect = require("./src/config/dbConnect");
const { seedSystemPermissions } = require("./src/seeds/systemPermissions");
 
const PORT = process.env.PORT || 3000;
 
dbConnect()
  .then(() => seedSystemPermissions())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });