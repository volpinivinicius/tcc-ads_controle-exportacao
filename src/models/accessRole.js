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
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccessRole", accessRoleSchema);