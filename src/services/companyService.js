/**
 * See README > Project Context and > Group companies and
 * external companies for the business rules behind isGroupCompany
 * and business roles. listCompanies filters by the requesting
 * user's links: SYSTEM sees all, others see only companies they
 * are linked to with COMPANY_VIEW.
 */

const Company = require("../models/company");
const CompanyPermissionPolicy = require("../models/companyPermissionPolicy");
const {
  hasSystemPermission,
  companyIdsWithPermission,
  assertCan,
} = require("./authorizationService");

function notFound() {
  const error = new Error("Company not found");
  error.status = 404;
  return error;
}

async function createCompany(data) {
  return Company.create(data);
}

/**
 * filters (all optional): businessRole (matches if present in
 * the array), isGroupCompany, isActive — each "true"/"false" as
 * strings (as they arrive from query params) or booleans.
 */
async function listCompanies(user, filters = {}) {
  const query = {};
  if (filters.businessRole) query.businessRoles = filters.businessRole;
  if (filters.isGroupCompany !== undefined && filters.isGroupCompany !== "") {
    query.isGroupCompany = filters.isGroupCompany === true || filters.isGroupCompany === "true";
  }
  if (filters.isActive !== undefined && filters.isActive !== "") {
    query.isActive = filters.isActive === true || filters.isActive === "true";
  }

  if (hasSystemPermission(user, "COMPANY_VIEW")) {
    return Company.find(query);
  }
  const allowedIds = companyIdsWithPermission(user, "COMPANY_VIEW");
  query._id = { $in: allowedIds };
  return Company.find(query);
}

async function getCompanyById(id) {
  const company = await Company.findById(id);
  if (!company) throw notFound();
  return company;
}

async function updateCompany(id, data) {
  const company = await Company.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!company) throw notFound();
  return company;
}

/**
 * Soft delete: deactivating a Company preserves its history (and
 * everything referencing it) — see README for the rationale.
 * TODO: does not yet cascade to the Company's own AccessRoles,
 * Users, or CompanyPermissionPolicy (deferred, tracked in the
 * model's comment).
 */
async function deactivateCompany(id) {
  const company = await Company.findByIdAndUpdate(
    id,
    { isActive: false },
    { returnDocument: "after" }
  );
  if (!company) throw notFound();
  return company;
}

async function reactivateCompany(id) {
  const company = await Company.findByIdAndUpdate(
    id,
    { isActive: true },
    { returnDocument: "after" }
  );
  if (!company) throw notFound();
  return company;
}

/**
 * True, permanent removal — System Administrator only, regardless
 * of any COMPANY-level permission the caller might have. Still
 * cascades the 1:1 CompanyPermissionPolicy, since that record has
 * no independent existence without its Company.
 */
async function hardDeleteCompany(id, actingUser) {
  assertCan(actingUser, "COMPANY_DELETE", null);
  const company = await Company.findByIdAndDelete(id);
  if (!company) throw notFound();
  await CompanyPermissionPolicy.findOneAndDelete({ company: id });
  return company;
}

module.exports = {
  createCompany,
  listCompanies,
  getCompanyById,
  updateCompany,
  deactivateCompany,
  reactivateCompany,
  hardDeleteCompany,
};