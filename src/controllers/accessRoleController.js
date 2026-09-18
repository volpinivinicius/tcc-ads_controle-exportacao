/**
 * CRUD for AccessRole. See README > The Service Center and >
 * Permission Delegation for the scope rules. Authorization
 * itself (who may act on which scope/company) is enforced inside
 * accessRoleService, since it depends on the record's data.
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

async function remove(req, res, next) {
  try {
    await accessRoleService.deleteAccessRole(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, getById, update, remove };