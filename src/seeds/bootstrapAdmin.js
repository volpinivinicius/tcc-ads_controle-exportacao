/**
 * Creates the first Company, SYSTEM-scoped AccessRole (with every
 * SystemPermission), and admin User — solving the chicken-and-egg
 * problem of POST /api/users requiring a SYSTEM token that doesn't
 * exist yet. Idempotent: safe to re-run, does nothing if a User
 * with the given email already exists.
 *
 * Values come from ADMIN_* env vars, falling back to defaults
 * (see .env.example). Change the default password immediately
 * after first login.
 *
 * Does not keep the AccessRole's permissions in sync with the
 * catalog after creation — if new SystemPermissions are added
 * later, grant them to this role manually through the app.
 */

const Company = require("../models/company");
const SystemPermission = require("../models/systemPermission");
const AccessRole = require("../models/accessRole");
const User = require("../models/user");

async function bootstrapAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin user already exists (${email}); skipping bootstrap.`);
    return;
  }

  const companyTaxId = process.env.ADMIN_COMPANY_TAX_ID || "00000000000000";
  let company = await Company.findOne({ taxId: companyTaxId });
  if (!company) {
    company = await Company.create({
      name: process.env.ADMIN_COMPANY_NAME || "Service Center HQ",
      taxId: companyTaxId,
      country: process.env.ADMIN_COMPANY_COUNTRY || "BR",
      businessRoles: ["EXPORTER"],
      isGroupCompany: true,
    });
    console.log(`Created bootstrap Company: ${company.name} (${company._id})`);
  }

  const allPermissions = await SystemPermission.find();
  if (allPermissions.length === 0) {
    throw new Error(
      "No SystemPermissions found — run the permissions seed before bootstrapping the admin."
    );
  }

  let role = await AccessRole.findOne({ scope: "SYSTEM", name: "System Administrator" });
  if (!role) {
    role = await AccessRole.create({
      name: "System Administrator",
      scope: "SYSTEM",
      permissions: allPermissions.map((p) => p._id),
    });
    console.log(`Created bootstrap AccessRole: ${role.name} (${role._id})`);
  }

  const password = process.env.ADMIN_PASSWORD || "changeme123";
  const user = await User.create({
    name: process.env.ADMIN_NAME || "System Administrator",
    email,
    password,
    links: [{ company: company._id, accessRole: role._id }],
  });

  console.log(`Created bootstrap admin user: ${user.email}`);
  console.log(`IMPORTANT: log in and change this password immediately: "${password}"`);
}

module.exports = { bootstrapAdmin };