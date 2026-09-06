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