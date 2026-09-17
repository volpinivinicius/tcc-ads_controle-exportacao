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

  const status = err.status || 500;
  // Only log genuinely unexpected errors; 401/403/404/etc. are normal,
  // expected outcomes (bad credentials, missing permission, etc.) and
  // would otherwise flood the logs.
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || "Internal server error" });
}

module.exports = { notFound, errorHandler };