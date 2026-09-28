/**
 * BASIC CRUD for Container. See containerService — entirely
 * SYSTEM-only for now. "delete" deactivates; "hardDelete"
 * performs true removal.
 */

const containerService = require("../services/containerService");

async function create(req, res, next) {
  try {
    const container = await containerService.createContainer(req.body, req.user);
    res.status(201).json(container);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const filters = { booking: req.query.booking, isActive: req.query.isActive };
    const containers = await containerService.listContainers(req.user, filters);
    res.json(containers);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const container = await containerService.getContainerById(req.params.id, req.user);
    res.json(container);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const container = await containerService.updateContainer(req.params.id, req.body, req.user);
    res.json(container);
  } catch (error) {
    next(error);
  }
}

async function deactivate(req, res, next) {
  try {
    const container = await containerService.deactivateContainer(req.params.id, req.user);
    res.json(container);
  } catch (error) {
    next(error);
  }
}

async function reactivate(req, res, next) {
  try {
    const container = await containerService.reactivateContainer(req.params.id, req.user);
    res.json(container);
  } catch (error) {
    next(error);
  }
}

async function hardDelete(req, res, next) {
  try {
    await containerService.hardDeleteContainer(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, getById, update, deactivate, reactivate, hardDelete };