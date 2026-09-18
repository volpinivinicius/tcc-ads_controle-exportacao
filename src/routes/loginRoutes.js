/**
 * Form-based login for the server-rendered pages. Reuses
 * authService.login (same as the JSON API), but stores the JWT
 * in an httpOnly cookie instead of returning it in the body.
 * Mounted before requireWebAuth, so it's reachable without a
 * session.
 */

const express = require("express");
const authService = require("../services/authService");

const router = express.Router();
const TOKEN_COOKIE_MAX_AGE = 8 * 60 * 60 * 1000; // 8h, matches the JWT's own expiry

router.get("/login", (req, res) => {
  try {
    if (req.cookies?.token) {
      authService.verifyToken(req.cookies.token);
      return res.redirect("/");
    }
  } catch (error) {
    // Invalid/expired cookie: fall through and show the login form.
  }
  res.render("login", { title: "Login", error: null });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token } = await authService.login(email, password);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: TOKEN_COOKIE_MAX_AGE,
    });
    res.redirect("/");
  } catch (error) {
    res.status(401).render("login", {
      title: "Login",
      error: "E-mail ou senha inválidos.",
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

module.exports = router;