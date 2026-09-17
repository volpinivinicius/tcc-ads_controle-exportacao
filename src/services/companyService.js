/**
 * See README > Project Context and > Group companies and
 * external companies for the business rules behind isGroupCompany
 * and business roles. listCompanies filters by the requesting
 * user's links: SYSTEM sees all, others see only companies they
 * are linked to with COMPANY_VIEW.
 */

const Company = require("../models/company");
const { hasSystemPermission, companyIdsWithPermission } = require("./authorizationService");

function notFound() {
  const error = new Error("Company not found");
  error.status = 404;
  return error;
}

async function createCompany(data) {
  return Company.create(data);
}

async function listCompanies(user) {
  if (hasSystemPermission(user, "COMPANY_VIEW")) {
    return Company.find();
  }
  const allowedIds = companyIdsWithPermission(user, "COMPANY_VIEW");
  return Company.find({ _id: { $in: allowedIds } });
}

async function getCompanyById(id) {
  const company = await Company.findById(id);
  if (!company) throw notFound();
  return company;
}

async function updateCompany(id, data) {
  const company = await Company.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!company) throw notFound();
  return company;
}

async function deleteCompany(id) {
  const company = await Company.findByIdAndDelete(id);
  if (!company) throw notFound();
  return company;
}

module.exports = {
  createCompany,
  listCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};