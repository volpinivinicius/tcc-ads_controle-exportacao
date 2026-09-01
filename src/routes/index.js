/**
 * Aggregates all the application's route modules. Individual
 * resource routes (e.g. router.use("/users", userRoutes)) are
 * added here as each one is implemented.
 */
 
const express = require("express");
const companyRoutes = require("./companyRoutes");
const systemPermissionRoutes = require("./systemPermissionRoutes");


const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/companies", companyRoutes);
router.use("/system-permissions", systemPermissionRoutes);
 
module.exports = router;