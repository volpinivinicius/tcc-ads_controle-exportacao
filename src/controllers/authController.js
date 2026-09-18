/**
 * POST /api/auth/login — issues a JWT for valid credentials.
 */

const authService = require("../services/authService");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    res.json({ token, user });
  } catch (error) {
    next(error);
  }
}

module.exports = { login };