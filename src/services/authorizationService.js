/**
 * Shared helpers for checking a User's links against a required
 * SystemPermission code, optionally scoped to a specific
 * company. See README > Authorization and Access Control
 * Architecture.
 */

function hasSystemPermission(user, code) {
  return user.links.some(
    (link) =>
      link.accessRole?.scope === "SYSTEM" &&
      link.accessRole.permissions?.some((p) => p.code === code)
  );
}

function hasCompanyPermission(user, companyId, code) {
  if (!companyId) return false;
  return user.links.some(
    (link) =>
      String(link.company?._id || link.company) === String(companyId) &&
      link.accessRole?.permissions?.some((p) => p.code === code)
  );
}

function can(user, code, companyId) {
  return hasSystemPermission(user, code) || hasCompanyPermission(user, companyId, code);
}

function forbidden(message) {
  const error = new Error(message || "Forbidden");
  error.status = 403;
  return error;
}

function assertCan(user, code, companyId, message) {
  if (!can(user, code, companyId)) {
    throw forbidden(message);
  }
}

/** Company ids the user has some link to (for filtering list results). */
function linkedCompanyIds(user) {
  return user.links.map((link) => String(link.company?._id || link.company));
}

/** Company ids the user can act on for a given permission code. */
function companyIdsWithPermission(user, code) {
  return user.links
    .filter((link) => link.accessRole?.permissions?.some((p) => p.code === code))
    .map((link) => String(link.company?._id || link.company));
}

module.exports = {
  hasSystemPermission,
  hasCompanyPermission,
  can,
  forbidden,
  assertCan,
  linkedCompanyIds,
  companyIdsWithPermission,
};