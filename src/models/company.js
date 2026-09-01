/**
 * Company represents an organization registered in the system.
 * businessRoles: EXPORTER, IMPORTER, CARRIER, or WAREHOUSE; a
 * company can hold more than one. taxId: legal registration
 * number (CNPJ, EIN, VAT, etc.), generic to support both
 * Brazilian and foreign companies.
 * See README > Project Context for the business rules behind
 * these fields (Service Center, group vs. external companies).
 */

const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    taxId: { type: String, required: true, unique: true, trim: true },
    country: { type: String, required: true, trim: true },
    businessRoles: {
      type: [String],
      enum: ["EXPORTER", "IMPORTER", "CARRIER", "WAREHOUSE"],
      required: true,
      validate: (roles) => roles.length > 0,
    },
    isGroupCompany: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Company", companySchema);