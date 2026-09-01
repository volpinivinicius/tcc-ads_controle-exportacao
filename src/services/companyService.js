/**
 * Company Service
 *
 * Contains the business logic related to Companies, such as
 * validating their business roles before persisting changes.
 *
 * Exporter and Importer are the initial roles supported by the
 * project. This service is designed to accommodate future
 * participants of the logistics process, such as carriers and
 * warehousing companies, keeping this logic isolated from the
 * Company Controller.
 *
 * Also manages the isGroupCompany flag, which identifies
 * Companies belonging to the corporate group.
 * This flag is used to validate that a Shipment's exporter or
 * importer is always a group Company, regardless of how many
 * external Companies (foreign buyers, carriers, warehouses)
 * participate in the same process.
 *
 * The Service Center is intentionally out of scope here: it is
 * not a Company attribute, but a matter of which AccessRole
 * scope is granted to users of a group Company. See the Access
 * Role Service for details.
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