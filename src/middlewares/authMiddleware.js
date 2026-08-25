/**
 * Auth Middleware
 *
 * Validates the JWT sent by the client on protected routes,
 * ensuring that only authenticated users can access the system.
 *
 * The decoded token is used to identify the requesting User and
 * attach their data to the request, making it available to the
 * next middlewares and controllers in the chain.
 *
 * Requests without a valid token are rejected before reaching
 * any protected route.
 */