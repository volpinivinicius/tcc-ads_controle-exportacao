/**
 * See README > Authorization and Access Control Architecture >
 * Permission Delegation for the business rules this enforces.
 */

const CompanyPermissionPolicy = require("../models/companyPermissionPolicy");
const Company = require("../models/company");
const SystemPermission = require("../models/systemPermission");

function notFound() {
  const error = new Error("Company permission policy not found");
  error.status = 404;
  return error;
}

async function validateReferences({ company, allowedPermissions }) {
  if (company) {
    const exists = await Company.exists({ _id: company });
    if (!exists) {
      const error = new Error("Company not found");
      error.status = 400;
      throw error;
    }
  }
  if (allowedPermissions && allowedPermissions.length > 0) {
    const count = await SystemPermission.countDocuments({
      _id: { $in: allowedPermissions },
    });
    if (count !== allowedPermissions.length) {
      const error = new Error("One or more allowedPermissions do not exist");
      error.status = 400;
      throw error;
    }
  }
}

async function createPolicy(data) {
  await validateReferences(data);
  return CompanyPermissionPolicy.create(data);
}

async function listPolicies() {
  return CompanyPermissionPolicy.find()
    .populate("company")
    .populate("allowedPermissions");
}

async function getPolicyByCompanyId(companyId) {
  const policy = await CompanyPermissionPolicy.findOne({
    company: companyId,
  }).populate("allowedPermissions");
  if (!policy) throw notFound();
  return policy;
}

async function updatePolicyByCompanyId(companyId, data) {
  await validateReferences(data);
  const policy = await CompanyPermissionPolicy.findOneAndUpdate(
    { company: companyId },
    data,
    { new: true, runValidators: true }
  );
  if (!policy) throw notFound();
  return policy;
}

async function deletePolicyByCompanyId(companyId) {
  const policy = await CompanyPermissionPolicy.findOneAndDelete({
    company: companyId,
  });
  if (!policy) throw notFound();
  return policy;
}

module.exports = {
  createPolicy,
  listPolicies,
  getPolicyByCompanyId,
  updatePolicyByCompanyId,
  deletePolicyByCompanyId,
};