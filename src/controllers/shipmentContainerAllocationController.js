/**
 * CRUD for ShipmentContainerAllocation. See
 * shipmentContainerAllocationService — authorization follows the
 * Shipment's exporter/importer company (SYSTEM bypasses). "remove"
 * is a true delete (no soft-delete here, see the model's comment).
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
    const filters = { shipment: req.query.shipment, container: req.query.container };
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

async function remove(req, res, next) {
  try {
    await service.removeAllocation(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, getById, update, remove };