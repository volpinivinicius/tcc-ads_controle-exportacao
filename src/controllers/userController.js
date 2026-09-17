/**
 * CRUD for User. See README > Users linked to multiple companies
 * for the links (company/accessRole pairs) being validated.
 * Authorization (SYSTEM-only create/update/delete, filtered view)
 * is enforced inside userService.
 */

const userService = require("../services/userService");

async function create(req, res, next) {
  try {
    const user = await userService.createUser(req.body, req.user);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const users = await userService.listUsers(req.user);
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id, req.user);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await userService.deleteUser(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, getById, update, remove };