/**
 * Verifies the Bearer JWT on protected API routes and attaches
 * the authenticated User (with links populated, including each
 * accessRole's permissions) as req.user.
 */

const authService = require("../services/authService");
const User = require("../models/user");

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      const error = new Error("Missing or invalid Authorization header");
      error.status = 401;
      throw error;
    }

    const payload = authService.verifyToken(token);
    const user = await User.findById(payload.sub)
      .populate("links.company")
      .populate({ path: "links.accessRole", populate: "permissions" });

    if (!user) {
      const error = new Error("User not found");
      error.status = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    error.status = error.status || 401;
    next(error);
  }
}

module.exports = { authenticate };