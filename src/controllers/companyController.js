/**
 * Company Controller
 *
 * Manages the creation, retrieval, update, and removal of
 * Companies registered in the system.
 *
 * Handles the definition of a Company's business roles
 * (Exporter, Importer, or both), which determine how the
 * organization participates in Shipments.
 *
 * Exporter and Importer are the initial roles supported by the
 * project. The controller is designed to accommodate future
 * participants of the logistics process, such as carriers and
 * warehousing companies, as the system grows to cover the full
 * shipment chain.
 *
 * Also exposes the isGroupCompany flag, which distinguishes
 * Companies belonging to the corporate group from external
 * Companies it only relates to through Shipments, such as
 * foreign buyers or third-party carriers and warehouses.
 *
 * Does not expose a "Service Center" role or type: the Service
 * Center is a team hosted within one of the group's own
 * Companies, represented through AccessRole scope rather than
 * Company data. See the Access Role Controller for details.
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
    const companies = await companyService.listCompanies();
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
 
async function remove(req, res, next) {
  try {
    await companyService.deleteCompany(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
 
module.exports = { create, list, getById, update, remove };