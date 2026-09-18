/**
 * See README > The Service Center and > Permission Delegation
 * for the business rules. Validates scope/company shape and that
 * permissions are allowed by the company's policy (for COMPANY/
 * ASSIGNED_SHIPMENT roles).
 *
 * Authorization: a SYSTEM-scoped role (creating, editing into,
 * editing out of, or deleting one) always requires a SYSTEM link
 * with the relevant permission. A COMPANY/ASSIGNED_SHIPMENT role
 * only requires a SYSTEM link or a link to that role's own
 * company with the relevant permission. This is what keeps a
 * Company Administrator from ever touching a user who currently
 * holds a SYSTEM-scoped role, even to downgrade it.
 */

const AccessRole = require("../models/accessRole");
const Company = require("../models/company");
const SystemPermission = require("../models/systemPermission");
const CompanyPermissionPolicy = require("../models/companyPermissionPolicy");
const {
  hasSystemPermission,
  assertCan,
  companyIdsWithPermission,
} = require("./authorizationService");

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

async function createAccessRole(data, user) {
  assertCan(
    user,
    "ACCESS_ROLE_CREATE",
    data.scope === "SYSTEM" ? null : data.company
  );
  await validateAccessRole(data);
  return AccessRole.create(data);
}

/** filters (all optional): scope, company (id), isActive ("true"/"false"). */
async function listAccessRoles(user, filters = {}) {
  const query = {};
  if (filters.scope) query.scope = filters.scope;
  if (filters.company) query.company = filters.company;
  if (filters.isActive !== undefined && filters.isActive !== "") {
    query.isActive = filters.isActive === true || filters.isActive === "true";
  }

  if (hasSystemPermission(user, "ACCESS_ROLE_VIEW")) {
    return AccessRole.find(query).populate("company").populate("permissions");
  }
  const allowedIds = companyIdsWithPermission(user, "ACCESS_ROLE_VIEW");
  query.company = filters.company
    ? filters.company // if they picked a specific company, keep it (still constrained by allowedIds below via $and semantics if needed)
    : { $in: allowedIds };
  if (filters.company && !allowedIds.includes(String(filters.company))) {
    // Requested a company outside what this user is allowed to view — return nothing rather than leaking existence.
    query.company = { $in: [] };
  }
  return AccessRole.find(query).populate("company").populate("permissions");
}

async function getAccessRoleById(id, user) {
  const role = await AccessRole.findById(id)
    .populate("company")
    .populate("permissions");
  if (!role) throw notFound();

  assertCan(
    user,
    "ACCESS_ROLE_VIEW",
    role.scope === "SYSTEM" ? null : role.company
  );
  return role;
}

async function updateAccessRole(id, data, user) {
  const current = await AccessRole.findById(id);
  if (!current) throw notFound();

  const merged = { ...current.toObject(), ...data };
  const requiresSystem = current.scope === "SYSTEM" || merged.scope === "SYSTEM";
  assertCan(
    user,
    "ACCESS_ROLE_UPDATE",
    requiresSystem ? null : merged.company
  );

  await validateAccessRole(merged);

  const role = await AccessRole.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
  return role;
}

/**
 * Soft delete: deactivating a role immediately limits every User
 * holding it (see authorizationService), without touching any
 * User record. Same authorization as before: a SYSTEM-scoped role
 * always requires a SYSTEM link; a COMPANY/ASSIGNED_SHIPMENT role
 * requires a SYSTEM link or a link to that role's own company.
 */
async function deactivateAccessRole(id, user) {
  const current = await AccessRole.findById(id);
  if (!current) throw notFound();

  assertCan(
    user,
    "ACCESS_ROLE_DELETE",
    current.scope === "SYSTEM" ? null : current.company
  );

  const role = await AccessRole.findByIdAndUpdate(id, { isActive: false }, { returnDocument: "after" });
  return role;
}

async function reactivateAccessRole(id, user) {
  const current = await AccessRole.findById(id);
  if (!current) throw notFound();

  assertCan(
    user,
    "ACCESS_ROLE_DELETE",
    current.scope === "SYSTEM" ? null : current.company
  );

  const role = await AccessRole.findByIdAndUpdate(id, { isActive: true }, { returnDocument: "after" });
  return role;
}

/**
 * True, permanent removal — System Administrator only, regardless
 * of the role's own scope or company (unlike deactivate, which a
 * Company Administrator can do for their own COMPANY-scoped roles).
 */
async function hardDeleteAccessRole(id, user) {
  assertCan(user, "ACCESS_ROLE_DELETE", null);
  const current = await AccessRole.findById(id);
  if (!current) throw notFound();

  await AccessRole.findByIdAndDelete(id);
  return current;
}

module.exports = {
  createAccessRole,
  listAccessRoles,
  getAccessRoleById,
  updateAccessRole,
  deactivateAccessRole,
  reactivateAccessRole,
  hardDeleteAccessRole,
};