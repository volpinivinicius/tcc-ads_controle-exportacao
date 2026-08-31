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
 
const express = require("express");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
 
const app = express();
 
app.use(express.json());
app.use(routes);
app.use(notFound);
app.use(errorHandler);
 
module.exports = app;