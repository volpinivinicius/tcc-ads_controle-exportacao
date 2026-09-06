/**
 * Application Setup
 *
 * Configures the Express application instance, including global
 * middlewares (such as JSON parsing), the aggregated application
 * routes, and the error handling middlewares.
 *
 * Exports the configured app so it can be imported and started
 * by the server entry point.
 */
 
const path = require("path");
const express = require("express");
const routes = require("./routes");
const viewRoutes = require("./routes/viewRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(express.json());
app.use("/api", routes);
app.use("/", viewRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;