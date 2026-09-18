const mongoose = require("mongoose");

/**
 * scope: SYSTEM, COMPANY, or ASSIGNED_SHIPMENT. company is
 * required for COMPANY/ASSIGNED_SHIPMENT and forbidden for
 * SYSTEM. See README > The Service Center and > Permission
 * Delegation for the business rules.
 */
const accessRoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    scope: {
      type: String,
      enum: ["SYSTEM", "COMPANY", "ASSIGNED_SHIPMENT"],
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: function () {
        return this.scope !== "SYSTEM";
      },
      validate: {
        validator: function (value) {
          return this.scope !== "SYSTEM" || !value;
        },
        message: "SYSTEM-scoped roles must not have a company.",
      },
    },
    permissions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "SystemPermission" },
    ],
    /**
     * Soft-delete flag. An inactive AccessRole grants no
     * permissions to any User holding it — see
     * authorizationService, which checks this before honoring a
     * link — so deactivating a role immediately limits every
     * User who has it, with no per-user bookkeeping needed. Only
     * the System Administrator can hard-delete a role.
     */
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccessRole", accessRoleSchema);