/**
 * Aggregates all the application's route modules. Individual
 * resource routes (e.g. router.use("/users", userRoutes)) are
 * added here as each one is implemented.
 */
 
const express = require("express");
const router = express.Router();


router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
 
module.exports = router;