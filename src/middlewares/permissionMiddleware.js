/**
 * requirePermission(code, getCompanyId?): allows the request if
 * req.user has a SYSTEM link with `code`, or a link to the
 * company resolved by getCompanyId(req) with `code`. Without
 * getCompanyId, only a SYSTEM-scoped link satisfies it — used
 * for actions that have no existing "owning" company yet (e.g.
 * creating a Company) or that are SYSTEM-only by design (e.g.
 * managing a CompanyPermissionPolicy).
 *
 * For resources where the "owning" company isn't the URL id
 * itself (AccessRole, User), the equivalent check is done inside
 * the service instead, since it needs the record's data.
 */

const { can } = require("../services/authorizationService");

function requirePermission(code, getCompanyId) {
  return (req, res, next) => {
    const companyId = getCompanyId ? getCompanyId(req) : null;
    if (!can(req.user, code, companyId)) {
      const error = new Error("Forbidden");
      error.status = 403;
      return next(error);
    }
    next();
  };
}

module.exports = { requirePermission };