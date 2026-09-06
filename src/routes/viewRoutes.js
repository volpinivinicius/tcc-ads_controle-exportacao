const express = require("express");
const companyService = require("../services/companyService");

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

router.get("/shipments", (req, res) => {
  res.render("placeholder", { title: "Embarques", activePage: "shipments" });
});

router.get("/bookings", (req, res) => {
  res.render("placeholder", { title: "Bookings", activePage: "bookings" });
});

router.get("/users", (req, res) => {
  res.render("placeholder", { title: "Usuários", activePage: "users" });
});

router.get("/access-roles", (req, res) => {
  res.render("placeholder", { title: "Perfis de acesso", activePage: "access-roles" });
});

module.exports = router;