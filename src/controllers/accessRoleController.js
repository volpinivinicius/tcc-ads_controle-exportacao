/**
 * CRUD for AccessRole. See README > The Service Center and >
 * Permission Delegation for the scope rules being validated.
 */

const accessRoleService = require("../services/accessRoleService");

async function create(req, res, next) {
  try {
    const role = await accessRoleService.createAccessRole(req.body);
    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const roles = await accessRoleService.listAccessRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const role = await accessRoleService.getAccessRoleById(req.params.id);
    res.json(role);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const role = await accessRoleService.updateAccessRole(req.params.id, req.body);
    res.json(role);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await accessRoleService.deleteAccessRole(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, getById, update, remove };