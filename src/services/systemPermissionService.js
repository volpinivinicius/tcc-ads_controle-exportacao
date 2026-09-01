/**
 * System Permission Service
 *
 * Contains the business logic related to System Permissions,
 * which are defined and maintained at the application level.
 *
 * Supports the retrieval of available permissions used by the
 * Company Permission Policy and Access Role services, keeping
 * this logic isolated from the System Permission Controller.
 */

const SystemPermission = require("../models/systemPermission");
 
async function listPermissions() {
  return SystemPermission.find().sort({ resource: 1, code: 1 });
}
 
async function getPermissionByCode(code) {
  const permission = await SystemPermission.findOne({ code: code.toUpperCase() });
  if (!permission) {
    const error = new Error("System permission not found");
    error.status = 404;
    throw error;
  }
  return permission;
}
 
module.exports = { listPermissions, getPermissionByCode };