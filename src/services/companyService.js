/**
 * See README > Project Context and > Group companies and
 * external companies for the business rules behind isGroupCompany
 * and business roles.
 */

const Company = require("../models/company");
 
function notFound() {
  const error = new Error("Company not found");
  error.status = 404;
  return error;
}
 
async function createCompany(data) {
  return Company.create(data);
}
 
async function listCompanies() {
  return Company.find();
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