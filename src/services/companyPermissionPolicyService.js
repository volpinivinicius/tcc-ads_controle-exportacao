/**
 * See README > Authorization and Access Control Architecture >
 * Permission Delegation for the business rules this enforces.
 *
 * Authorization: this entire resource is SYSTEM-only — only the
 * System Administrator manages a Company's Permission Policy, no
 * delegation to Company Administrators. Enforced here (not just
 * at the route level) so it also protects the server-rendered
 * page, which calls this service directly.
 */

const CompanyPermissionPolicy = require("../models/companyPermissionPolicy");
const Company = require("../models/company");
const SystemPermission = require("../models/systemPermission");
const { assertCan } = require("./authorizationService");

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

async function createPolicy(data, user) {
  assertCan(user, "PERMISSION_POLICY_MANAGE", null);
  await validateReferences(data);
  return CompanyPermissionPolicy.create(data);
}

async function listPolicies(user) {
  assertCan(user, "PERMISSION_POLICY_VIEW", null);
  return CompanyPermissionPolicy.find()
    .populate("company")
    .populate("allowedPermissions");
}

async function getPolicyByCompanyId(companyId, user) {
  assertCan(user, "PERMISSION_POLICY_VIEW", null);
  const policy = await CompanyPermissionPolicy.findOne({
    company: companyId,
  }).populate("allowedPermissions");
  if (!policy) throw notFound();
  return policy;
}

async function updatePolicyByCompanyId(companyId, data, user) {
  assertCan(user, "PERMISSION_POLICY_MANAGE", null);
  await validateReferences(data);
  const policy = await CompanyPermissionPolicy.findOneAndUpdate(
    { company: companyId },
    data,
    { new: true, runValidators: true }
  );
  if (!policy) throw notFound();
  return policy;
}

async function deletePolicyByCompanyId(companyId, user) {
  assertCan(user, "PERMISSION_POLICY_MANAGE", null);
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