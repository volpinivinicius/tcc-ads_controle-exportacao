/**
 * Issues and verifies the JWT used by the API. Payload only
 * carries the user id (sub) — the User's links/permissions are
 * always re-read from the database on each request, so a
 * revoked AccessRole or removed link takes effect immediately,
 * without waiting for the token to expire.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const TOKEN_EXPIRES_IN = "8h";

function unauthorized(message) {
  const error = new Error(message);
  error.status = 401;
  return error;
}

async function login(email, password) {
  if (!email || !password) throw unauthorized("Invalid credentials");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw unauthorized("Invalid credentials");

  const matches = await user.comparePassword(password);
  if (!matches) throw unauthorized("Invalid credentials");

  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });

  return { token, user };
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { login, verifyToken };