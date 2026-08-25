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