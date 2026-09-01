/**
 * System Permission Schema
 *
 * Represents an action or capability available within the system,
 * such as reading, creating, updating, or deleting a resource.
 *
 * System permissions are defined and maintained at the application
 * level and are not directly created, modified, or deleted by users.
 *
 * Permissions can be assigned to AccessRoles according to the
 * permission policies established for each company.
 */

/**
 * Read-only catalog: populated via the seed script
 * (src/seeds/systemPermissions.js), not through the API.
 */

const mongoose = require("mongoose");
 
const systemPermissionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    description: { type: String, required: true, trim: true },
    resource: { type: String, required: true, trim: true, uppercase: true },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("SystemPermission", systemPermissionSchema);