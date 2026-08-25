/**
 * Database Connection
 *
 * Establishes the connection between the application and the
 * MongoDB database using the connection string provided through
 * the MONGO_URI environment variable.
 *
 * Centralizes the Mongoose connection logic so it can be reused
 * and initialized once when the server starts.
 */