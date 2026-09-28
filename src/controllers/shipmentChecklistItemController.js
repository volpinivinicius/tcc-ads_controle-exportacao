/**
 * CRUD for ShipmentChecklistItem, nested under a Shipment. See
 * shipmentChecklistItemService for authorization. "complete" is
 * the only mutation exposed for status — there's no general
 * update, matching the checklist's simple pending/completed
 * nature.
 */

const service = require("../services/shipmentChecklistItemService");

async function create(req, res, next) {
  try {
    const item = await service.createChecklistItem(
      { shipment: req.params.id, documentName: req.body.documentName },
      req.user
    );
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const items = await service.listChecklistItems(req.params.id, req.user);
    res.json(items);
  } catch (error) {
    next(error);
  }
}

async function complete(req, res, next) {
  try {
    const item = await service.completeChecklistItem(req.params.itemId, req.user);
    res.json(item);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await service.deleteChecklistItem(req.params.itemId, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, complete, remove };