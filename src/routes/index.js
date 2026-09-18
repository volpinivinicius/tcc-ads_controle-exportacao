/**
 * Aggregates all the application's route modules. Individual
 * resource routes (e.g. router.use("/users", userRoutes)) are
 * added here as each one is implemented.
 */

const express = require("express");
const authRoutes = require("./authRoutes");
const companyRoutes = require("./companyRoutes");
const systemPermissionRoutes = require("./systemPermissionRoutes");
const companyPermissionPolicyRoutes = require("./companyPermissionPolicyRoutes");
const accessRoleRoutes = require("./accessRoleRoutes");
const userRoutes = require("./userRoutes");
const shipmentRoutes = require("./shipmentRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/companies", companyRoutes);
router.use("/system-permissions", systemPermissionRoutes);
router.use("/company-permission-policies", companyPermissionPolicyRoutes);
router.use("/access-roles", accessRoleRoutes);
router.use("/users", userRoutes);
router.use("/shipments", shipmentRoutes);

module.exports = router;