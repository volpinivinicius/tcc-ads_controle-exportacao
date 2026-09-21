const Company = require("../models/company");
const SystemPermission = require("../models/systemPermission");
const AccessRole = require("../models/accessRole");
const User = require("../models/user");

async function syncSystemAdministratorPermissions() {
  const role = await AccessRole.findOne({ scope: "SYSTEM", name: "System Administrator" });
  if (!role) return; // nothing to sync yet — bootstrapAdmin() will create it

  const allPermissions = await SystemPermission.find();
  await AccessRole.findByIdAndUpdate(role._id, {
    permissions: allPermissions.map((p) => p._id),
  });
  console.log(`Synced System Administrator role with ${allPermissions.length} permissions`);
}

async function bootstrapAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin user already exists (${email}); skipping creation.`);
    await syncSystemAdministratorPermissions();
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

module.exports = { bootstrapAdmin, syncSystemAdministratorPermissions };