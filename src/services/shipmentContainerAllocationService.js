/**
 * BASIC version — see the model's comment for the deferred
 * ASSIGNED_SHIPMENT visibility (depends on exportStage/
 * importStage, not yet implemented). For now, authorization
 * follows the same rule as Shipment: SYSTEM, or a link to the
 * Shipment's exporter OR importer company.
 */

const ShipmentContainerAllocation = require("../models/shipmentContainerAllocation");
const Shipment = require("../models/shipment");
const Container = require("../models/container");
const {
  hasSystemPermission,
  hasCompanyPermission,
  forbidden,
} = require("./authorizationService");

function notFound() {
  const error = new Error("Allocation not found");
  error.status = 404;
  return error;
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function assertCanOnShipment(user, code, shipment) {
  if (
    hasSystemPermission(user, code) ||
    hasCompanyPermission(user, shipment.exporterCompany, code) ||
    hasCompanyPermission(user, shipment.importerCompany, code)
  ) {
    return;
  }
  throw forbidden();
}

async function loadShipmentOrThrow(shipmentId) {
  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) throw badRequest("Shipment not found");
  return shipment;
}

async function validateContainer(containerId) {
  const exists = await Container.exists({ _id: containerId });
  if (!exists) throw badRequest("Container not found");
}

async function createAllocation(data, actingUser) {
  const shipment = await loadShipmentOrThrow(data.shipment);
  assertCanOnShipment(actingUser, "ALLOCATION_CREATE", shipment);
  await validateContainer(data.container);
  return ShipmentContainerAllocation.create(data);
}

/** filters (all optional): shipment (id), container (id), isActive ("true"/"false"). */
async function listAllocations(actingUser, filters = {}) {
  const query = {};
  if (filters.shipment) query.shipment = filters.shipment;
  if (filters.container) query.container = filters.container;
  if (filters.isActive !== undefined && filters.isActive !== "") {
    query.isActive = filters.isActive === true || filters.isActive === "true";
  }

  if (hasSystemPermission(actingUser, "ALLOCATION_VIEW")) {
    return ShipmentContainerAllocation.find(query)
      .populate("shipment")
      .populate("container");
  }

  // Without SYSTEM, only allocations for Shipments the user can act on are visible.
  const allocations = await ShipmentContainerAllocation.find(query)
    .populate("shipment")
    .populate("container");
  return allocations.filter((allocation) => {
    try {
      assertCanOnShipment(actingUser, "ALLOCATION_VIEW", allocation.shipment);
      return true;
    } catch (error) {
      return false;
    }
  });
}

async function getAllocationById(id, actingUser) {
  const allocation = await ShipmentContainerAllocation.findById(id)
    .populate("shipment")
    .populate("container");
  if (!allocation) throw notFound();

  assertCanOnShipment(actingUser, "ALLOCATION_VIEW", allocation.shipment);
  return allocation;
}

async function updateAllocation(id, data, actingUser) {
  const current = await ShipmentContainerAllocation.findById(id);
  if (!current) throw notFound();

  const shipment = await loadShipmentOrThrow(data.shipment || current.shipment);
  assertCanOnShipment(actingUser, "ALLOCATION_UPDATE", shipment);

  if (data.container) await validateContainer(data.container);

  return ShipmentContainerAllocation.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
}

async function deactivateAllocation(id, actingUser) {
  const current = await ShipmentContainerAllocation.findById(id);
  if (!current) throw notFound();
  const shipment = await loadShipmentOrThrow(current.shipment);
  assertCanOnShipment(actingUser, "ALLOCATION_DELETE", shipment);

  return ShipmentContainerAllocation.findByIdAndUpdate(id, { isActive: false }, { returnDocument: "after" });
}

async function reactivateAllocation(id, actingUser) {
  const current = await ShipmentContainerAllocation.findById(id);
  if (!current) throw notFound();
  const shipment = await loadShipmentOrThrow(current.shipment);
  assertCanOnShipment(actingUser, "ALLOCATION_DELETE", shipment);

  return ShipmentContainerAllocation.findByIdAndUpdate(id, { isActive: true }, { returnDocument: "after" });
}

/** True, permanent removal — System Administrator only, unconditionally. */
async function hardDeleteAllocation(id, actingUser) {
  if (!hasSystemPermission(actingUser, "ALLOCATION_DELETE")) throw forbidden();
  const allocation = await ShipmentContainerAllocation.findByIdAndDelete(id);
  if (!allocation) throw notFound();
  return allocation;
}

module.exports = {
  createAllocation,
  listAllocations,
  getAllocationById,
  updateAllocation,
  deactivateAllocation,
  reactivateAllocation,
  hardDeleteAllocation,
};