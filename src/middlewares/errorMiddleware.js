/**
 * Error Middleware
 *
 * Centralizes the handling of errors thrown throughout the
 * application, preventing unhandled exceptions from crashing
 * the server or exposing internal details to the client.
 *
 * Includes a handler for requests made to non-existent routes
 * and a global error handler that formats and returns a
 * consistent error response for the API.
 */

/** Catches requests to routes that don't exist. */
function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
}
 
/** Formats any error thrown/forwarded in the request pipeline. */
function errorHandler(err, req, res, next) {
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid id format" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate value", fields: err.keyValue });
  }
 
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
}
 
module.exports = { notFound, errorHandler };