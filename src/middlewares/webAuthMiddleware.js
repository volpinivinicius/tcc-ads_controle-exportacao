/**
 * Cookie-based equivalent of authMiddleware, for the server-rendered
 * pages (which call services directly, not through the JSON API).
 * Reads the JWT from the httpOnly "token" cookie instead of the
 * Authorization header; redirects to /login instead of returning
 * 401 JSON, since this guards pages a browser navigates to.
 *
 * Sets both req.user (for route handlers) and res.locals.user (so
 * every EJS template, including partials like the sidebar, can
 * reference the logged-in user without each route passing it in).
 */

const authService = require("../services/authService");
const User = require("../models/user");

async function requireWebAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.redirect("/login");

    const payload = authService.verifyToken(token);
    const user = await User.findById(payload.sub)
      .populate("links.company")
      .populate({ path: "links.accessRole", populate: "permissions" });

    if (!user) return res.redirect("/login");

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    res.redirect("/login");
  }
}

module.exports = { requireWebAuth };