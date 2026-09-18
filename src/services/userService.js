/**
 * See README > Users linked to multiple companies. Validates
 * each link's company/accessRole exist, that a non-SYSTEM
 * accessRole belongs to that same link's company, and that no
 * company is linked more than once per user.
 *
 * Authorization: creating a User is SYSTEM-only (USER_CREATE),
 * per an explicit product decision — every User is registered by
 * the System Administrator, who must specify which company(ies)
 * it is linked to. Viewing is filtered: SYSTEM sees every User,
 * others only see Users who share a link to one of their own
 * companies (with USER_VIEW).
 *
 * SIMPLIFICATION (documented, not an oversight): general update
 * (name, email, links) is SYSTEM-only for now, rather than
 * allowing a Company Administrator to manage members of their own
 * company. Revisit if that finer-grained delegation is needed.
 *
 * Deactivate/reactivate are the one exception: a Company
 * Administrator CAN deactivate or reactivate a User who shares a
 * link to their own company (with USER_DELETE) — this is what
 * lets a company manage its own team's access without needing the
 * System Administrator for that specific action. True hard
 * deletion remains SYSTEM-only, unconditionally.
 */

const User = require("../models/user");
const Company = require("../models/company");
const AccessRole = require("../models/accessRole");
const {
  hasSystemPermission,
  assertCan,
  forbidden,
  companyIdsWithPermission,
} = require("./authorizationService");

function notFound() {
  const error = new Error("User not found");
  error.status = 404;
  return error;
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

/** Throws unless actingUser is SYSTEM or shares a company link with `code` with the target's own links. */
function assertSharedCompanyPermission(actingUser, targetLinks, code) {
  if (hasSystemPermission(actingUser, code)) return;
  const allowedIds = new Set(companyIdsWithPermission(actingUser, code));
  const shared = targetLinks.some((link) =>
    allowedIds.has(String(link.company?._id || link.company))
  );
  if (!shared) throw forbidden();
}

async function validateLinks(links) {
  if (!links || links.length === 0) {
    throw badRequest("At least one company/accessRole link is required");
  }

  const companyIds = links.map((link) => String(link.company));
  if (new Set(companyIds).size !== companyIds.length) {
    throw badRequest("A user cannot have more than one link to the same company");
  }

  for (const link of links) {
    const companyExists = await Company.exists({ _id: link.company });
    if (!companyExists) throw badRequest("Company not found in one of the links");

    const role = await AccessRole.findById(link.accessRole);
    if (!role) throw badRequest("Access role not found in one of the links");

    if (role.scope !== "SYSTEM" && String(role.company) !== String(link.company)) {
      throw badRequest(
        "A link's access role must belong to the same company as the link, unless it is SYSTEM-scoped"
      );
    }
  }
}

async function createUser(data, actingUser) {
  assertCan(actingUser, "USER_CREATE", null);
  await validateLinks(data.links);
  return User.create(data);
}

/** filters (all optional): company (id, matches any link), isActive ("true"/"false"). */
async function listUsers(actingUser, filters = {}) {
  const query = {};
  if (filters.isActive !== undefined && filters.isActive !== "") {
    query.isActive = filters.isActive === true || filters.isActive === "true";
  }

  if (hasSystemPermission(actingUser, "USER_VIEW")) {
    if (filters.company) query["links.company"] = filters.company;
    return User.find(query).populate("links.company").populate("links.accessRole");
  }

  const allowedIds = companyIdsWithPermission(actingUser, "USER_VIEW");
  if (filters.company && !allowedIds.includes(String(filters.company))) {
    // Requested a company outside what this user is allowed to view — return nothing rather than leaking existence.
    query["links.company"] = { $in: [] };
  } else {
    query["links.company"] = filters.company ? filters.company : { $in: allowedIds };
  }
  return User.find(query).populate("links.company").populate("links.accessRole");
}

async function getUserById(id, actingUser) {
  const user = await User.findById(id)
    .populate("links.company")
    .populate("links.accessRole");
  if (!user) throw notFound();

  assertSharedCompanyPermission(actingUser, user.links, "USER_VIEW");
  return user;
}

async function updateUser(id, data, actingUser) {
  assertCan(actingUser, "USER_UPDATE", null);

  const current = await User.findById(id);
  if (!current) throw notFound();

  if (data.links) {
    await validateLinks(data.links);
  }

  const user = await User.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
  return user;
}

async function deactivateUser(id, actingUser) {
  const target = await User.findById(id)
    .populate("links.company")
    .populate("links.accessRole");
  if (!target) throw notFound();

  assertSharedCompanyPermission(actingUser, target.links, "USER_DELETE");

  const user = await User.findByIdAndUpdate(id, { isActive: false }, { returnDocument: "after" });
  return user;
}

async function reactivateUser(id, actingUser) {
  const target = await User.findById(id)
    .populate("links.company")
    .populate("links.accessRole");
  if (!target) throw notFound();

  assertSharedCompanyPermission(actingUser, target.links, "USER_DELETE");

  const user = await User.findByIdAndUpdate(id, { isActive: true }, { returnDocument: "after" });
  return user;
}

/** True, permanent removal — System Administrator only, unconditionally. */
async function hardDeleteUser(id, actingUser) {
  assertCan(actingUser, "USER_DELETE", null);
  const user = await User.findByIdAndDelete(id);
  if (!user) throw notFound();
  return user;
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  hardDeleteUser,
};