/**
 * Read-only endpoints: the catalog is maintained via the seed
 * script, not exposed for creation/update/removal via the API.
 */

const systemPermissionService = require("../services/systemPermissionService");
 
async function list(req, res, next) {
  try {
    const permissions = await systemPermissionService.listPermissions();
    res.json(permissions);
  } catch (error) {
    next(error);
  }
}
 
async function getByCode(req, res, next) {
  try {
    const permission = await systemPermissionService.getPermissionByCode(req.params.code);
    res.json(permission);
  } catch (error) {
    next(error);
  }
}
 
module.exports = { list, getByCode };