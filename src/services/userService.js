/**
 * See README > Users linked to multiple companies. Validates
 * each link's company/accessRole exist, that a non-SYSTEM
 * accessRole belongs to that same link's company, and that no
 * company is linked more than once per user.
 *
 * NOTE: does not yet enforce *who* may call this, nor the
 * SYSTEM-scoped downgrade protection — that requires real
 * authentication, still pending.
 */

const User = require("../models/user");
const Company = require("../models/company");
const AccessRole = require("../models/accessRole");

function notFound() {
  const error = new Error("User not found");
  error.status = 404;
  return error;
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function validateLinks(links) {
  if (!links || links.length === 0) {
    throw badRequest("At least one company/accessRole link is required");
  }

  const companyIds = links.map((link) => String(link.company));
  if (new Set(companyIds).size !== companyIds.length) {
    throw badRequest("A user cannot have more than one link to the same company");
  }

  for (const link of links) {
    const companyExists = await Company.exists({ _id: link.company });
    if (!companyExists) throw badRequest("Company not found in one of the links");

    const role = await AccessRole.findById(link.accessRole);
    if (!role) throw badRequest("Access role not found in one of the links");

    if (role.scope !== "SYSTEM" && String(role.company) !== String(link.company)) {
      throw badRequest(
        "A link's access role must belong to the same company as the link, unless it is SYSTEM-scoped"
      );
    }
  }
}

async function createUser(data) {
  await validateLinks(data.links);
  return User.create(data);
}

async function listUsers() {
  return User.find().populate("links.company").populate("links.accessRole");
}

async function getUserById(id) {
  const user = await User.findById(id)
    .populate("links.company")
    .populate("links.accessRole");
  if (!user) throw notFound();
  return user;
}

async function updateUser(id, data) {
  const current = await User.findById(id);
  if (!current) throw notFound();

  if (data.links) {
    await validateLinks(data.links);
  }

  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return user;
}

async function deleteUser(id) {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw notFound();
  return user;
}

module.exports = { createUser, listUsers, getUserById, updateUser, deleteUser };