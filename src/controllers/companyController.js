/**
 * CRUD for Company. See README > Project Context and > Group
 * companies and external companies for the business rules
 * behind businessRoles and isGroupCompany.
 *
 * "delete" deactivates (soft delete, see companyService); a
 * separate "hardDelete" performs true removal, System
 * Administrator only.
 */

const companyService = require("../services/companyService");

async function create(req, res, next) {
  try {
    const company = await companyService.createCompany(req.body);
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const companies = await companyService.listCompanies(req.user);
    res.json(companies);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const company = await companyService.getCompanyById(req.params.id);
    res.json(company);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const company = await companyService.updateCompany(req.params.id, req.body);
    res.json(company);
  } catch (error) {
    next(error);
  }
}

async function deactivate(req, res, next) {
  try {
    const company = await companyService.deactivateCompany(req.params.id);
    res.json(company);
  } catch (error) {
    next(error);
  }
}

async function reactivate(req, res, next) {
  try {
    const company = await companyService.reactivateCompany(req.params.id);
    res.json(company);
  } catch (error) {
    next(error);
  }
}

async function hardDelete(req, res, next) {
  try {
    await companyService.hardDeleteCompany(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, getById, update, deactivate, reactivate, hardDelete };