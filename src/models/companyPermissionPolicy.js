/**
 * One policy per company (unique). See README > Authorization
 * and Access Control Architecture > Permission Delegation for
 * the business rules.
 */

const mongoose = require("mongoose");

const companyPermissionPolicySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
    },
    allowedPermissions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "SystemPermission" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CompanyPermissionPolicy",
  companyPermissionPolicySchema
);