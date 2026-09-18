/**
 * CRUD for AccessRole. See README > The Service Center and >
 * Permission Delegation for the scope rules. Authorization is
 * enforced inside accessRoleService, since it depends on the
 * record's data. "delete" deactivates (soft, see service); a
 * separate "hardDelete" performs true removal, always requiring
 * a SYSTEM link regardless of the role's own scope/company.
 */

const accessRoleService = require("../services/accessRoleService");

async function create(req, res, next) {
  try {
    const role = await accessRoleService.createAccessRole(req.body, req.user);
    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const roles = await accessRoleService.listAccessRoles(req.user);
    res.json(roles);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const role = await accessRoleService.getAccessRoleById(req.params.id, req.user);
    res.json(role);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const role = await accessRoleService.updateAccessRole(req.params.id, req.body, req.user);
    res.json(role);
  } catch (error) {
    next(error);
  }
}

async function deactivate(req, res, next) {
  try {
    const role = await accessRoleService.deactivateAccessRole(req.params.id, req.user);
    res.json(role);
  } catch (error) {
    next(error);
  }
}

async function reactivate(req, res, next) {
  try {
    const role = await accessRoleService.reactivateAccessRole(req.params.id, req.user);
    res.json(role);
  } catch (error) {
    next(error);
  }
}

async function hardDelete(req, res, next) {
  try {
    await accessRoleService.hardDeleteAccessRole(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, getById, update, deactivate, reactivate, hardDelete };