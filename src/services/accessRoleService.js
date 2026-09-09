/**
 * See README > The Service Center and > Permission Delegation
 * for the business rules. Validates scope/company shape and that
 * permissions are allowed by the company's policy (for COMPANY/
 * ASSIGNED_SHIPMENT roles).
 *
 * NOTE: does not yet enforce *who* may call this (System
 * Administrator vs. Company Administrator, or the SYSTEM-scoped
 * downgrade protection) — that requires real authentication and
 * User/AccessRole wiring, still pending.
 */

const AccessRole = require("../models/accessRole");
const Company = require("../models/company");
const SystemPermission = require("../models/systemPermission");
const CompanyPermissionPolicy = require("../models/companyPermissionPolicy");

function notFound() {
  const error = new Error("Access role not found");
  error.status = 404;
  return error;
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function validatePermissionsExist(permissionIds) {
  if (!permissionIds || permissionIds.length === 0) return;
  const count = await SystemPermission.countDocuments({
    _id: { $in: permissionIds },
  });
  if (count !== permissionIds.length) {
    throw badRequest("One or more permissions do not exist");
  }
}

async function validateAgainstCompanyPolicy(companyId, permissionIds) {
  if (!permissionIds || permissionIds.length === 0) return;
  const policy = await CompanyPermissionPolicy.findOne({ company: companyId });
  const allowed = new Set((policy?.allowedPermissions || []).map(String));
  const disallowed = permissionIds.filter((id) => !allowed.has(String(id)));
  if (disallowed.length > 0) {
    throw badRequest(
      "One or more permissions are not allowed by the company's permission policy"
    );
  }
}

async function validateAccessRole({ scope, company, permissions }) {
  if (scope === "SYSTEM" && company) {
    throw badRequest("SYSTEM-scoped roles must not have a company");
  }
  if (scope !== "SYSTEM" && !company) {
    throw badRequest("COMPANY/ASSIGNED_SHIPMENT roles require a company");
  }
  if (company) {
    const exists = await Company.exists({ _id: company });
    if (!exists) throw badRequest("Company not found");
  }

  await validatePermissionsExist(permissions);
  if (scope !== "SYSTEM") {
    await validateAgainstCompanyPolicy(company, permissions);
  }
}

async function createAccessRole(data) {
  await validateAccessRole(data);
  return AccessRole.create(data);
}

async function listAccessRoles() {
  return AccessRole.find().populate("company").populate("permissions");
}

async function getAccessRoleById(id) {
  const role = await AccessRole.findById(id)
    .populate("company")
    .populate("permissions");
  if (!role) throw notFound();
  return role;
}

async function updateAccessRole(id, data) {
  const current = await AccessRole.findById(id);
  if (!current) throw notFound();

  const merged = { ...current.toObject(), ...data };
  await validateAccessRole(merged);

  const role = await AccessRole.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return role;
}

async function deleteAccessRole(id) {
  const role = await AccessRole.findByIdAndDelete(id);
  if (!role) throw notFound();
  return role;
}

module.exports = {
  createAccessRole,
  listAccessRoles,
  getAccessRoleById,
  updateAccessRole,
  deleteAccessRole,
};