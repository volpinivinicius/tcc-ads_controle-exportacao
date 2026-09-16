const express = require("express");
const companyService = require("../services/companyService");
const systemPermissionService = require("../services/systemPermissionService");
const companyPermissionPolicyService = require("../services/companyPermissionPolicyService");
const accessRoleService = require("../services/accessRoleService");
const userService = require("../services/userService");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("dashboard", { title: "Dashboard" });
});

router.get("/companies", async (req, res, next) => {
  try {
    const companies = await companyService.listCompanies();
    res.render("companies", { title: "Empresas", companies });
  } catch (error) {
    next(error);
  }
});

router.get("/system-permissions", async (req, res, next) => {
  try {
    const permissions = await systemPermissionService.listPermissions();
    res.render("systemPermissions", { title: "Permissões do Sistema", permissions });
  } catch (error) {
    next(error);
  }
});

router.get("/company-permission-policies", async (req, res, next) => {
  try {
    const policies = await companyPermissionPolicyService.listPolicies();
    res.render("companyPermissionPolicies", {
      title: "Políticas de Permissão",
      policies,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/access-roles", async (req, res, next) => {
  try {
    const roles = await accessRoleService.listAccessRoles();
    res.render("accessRoles", { title: "Perfis de Acesso", roles });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await userService.listUsers();
    res.render("users", { title: "Usuários", users });
  } catch (error) {
    next(error);
  }
});

router.get("/shipments", (req, res) => {
  res.render("placeholder", { title: "Embarques", activePage: "shipments" });
});

router.get("/bookings", (req, res) => {
  res.render("placeholder", { title: "Bookings", activePage: "bookings" });
});

module.exports = router;