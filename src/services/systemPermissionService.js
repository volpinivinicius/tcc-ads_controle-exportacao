/**
 * Read-only: the catalog is maintained via the seed script,
 * not by users. See src/seeds/systemPermissions.js.
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