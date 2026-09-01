/**
 * System Permission Controller
 *
 * Manages the retrieval of System Permissions available within
 * the application.
 *
 * As these permissions are defined and maintained at the
 * application level, this controller does not expose creation,
 * update, or removal operations to regular Users or Companies.
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