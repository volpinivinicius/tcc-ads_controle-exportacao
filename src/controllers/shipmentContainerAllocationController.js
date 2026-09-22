/**
 * BASIC CRUD for ShipmentContainerAllocation. See
 * shipmentContainerAllocationService — authorization follows the
 * Shipment's exporter/importer company (SYSTEM bypasses). "delete"
 * deactivates; "hardDelete" performs true removal, System
 * Administrator only.
 */

const service = require("../services/shipmentContainerAllocationService");

async function create(req, res, next) {
  try {
    const allocation = await service.createAllocation(req.body, req.user);
    res.status(201).json(allocation);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const filters = {
      shipment: req.query.shipment,
      container: req.query.container,
      isActive: req.query.isActive,
    };
    const allocations = await service.listAllocations(req.user, filters);
    res.json(allocations);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const allocation = await service.getAllocationById(req.params.id, req.user);
    res.json(allocation);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const allocation = await service.updateAllocation(req.params.id, req.body, req.user);
    res.json(allocation);
  } catch (error) {
    next(error);
  }
}

async function deactivate(req, res, next) {
  try {
    const allocation = await service.deactivateAllocation(req.params.id, req.user);
    res.json(allocation);
  } catch (error) {
    next(error);
  }
}

async function reactivate(req, res, next) {
  try {
    const allocation = await service.reactivateAllocation(req.params.id, req.user);
    res.json(allocation);
  } catch (error) {
    next(error);
  }
}

async function hardDelete(req, res, next) {
  try {
    await service.hardDeleteAllocation(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, getById, update, deactivate, reactivate, hardDelete };