/**
 * See the model's comment for the general design, including why
 * removal is a true delete rather than the project's usual soft
 * delete.
 *
 * Authorization: CREATE/UPDATE/DELETE follow Shipment's own rule
 * (SYSTEM, or a link to the Shipment's exporter OR importer
 * company) — the Service Center/exporter/importer manages
 * allocations, not the assigned carrier. VIEW additionally
 * extends to ASSIGNED_SHIPMENT, resolved against the allocation's
 * own `stage`: a Company assigned as carrier/warehouse on that
 * specific stage of the Shipment can view the allocation.
 */

const ShipmentContainerAllocation = require("../models/shipmentContainerAllocation");
const Shipment = require("../models/shipment");
const Container = require("../models/container");
const {
  hasSystemPermission,
  hasCompanyPermission,
  hasAssignedShipmentPermission,
  forbidden,
} = require("./authorizationService");
const shipmentNoteService = require("./shipmentNoteService");

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

/** The stage-specific carrier/warehouse ids this allocation resolves against. */
function allocationStageCompanyIds(shipment, stage) {
  if (stage === "EXPORT") {
    return [shipment.exportStage?.carrierCompany, shipment.exportStage?.warehouseCompany].filter(Boolean);
  }
  if (stage === "IMPORT") {
    return [shipment.importStage?.carrierCompany, shipment.importStage?.warehouseCompany].filter(Boolean);
  }
  // No stage on the allocation (simple EXPORT/IMPORT shipment): whichever stage is populated.
  return [
    shipment.exportStage?.carrierCompany,
    shipment.exportStage?.warehouseCompany,
    shipment.importStage?.carrierCompany,
    shipment.importStage?.warehouseCompany,
  ].filter(Boolean);
}

function assertCanViewAllocation(user, allocation) {
  const shipment = allocation.shipment;
  if (
    hasSystemPermission(user, "ALLOCATION_VIEW") ||
    hasCompanyPermission(user, shipment.exporterCompany?._id || shipment.exporterCompany, "ALLOCATION_VIEW") ||
    hasCompanyPermission(user, shipment.importerCompany?._id || shipment.importerCompany, "ALLOCATION_VIEW") ||
    hasAssignedShipmentPermission(user, "ALLOCATION_VIEW", allocationStageCompanyIds(shipment, allocation.stage))
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

/** filters (all optional): shipment (id), container (id). */
async function listAllocations(actingUser, filters = {}) {
  const query = {};
  if (filters.shipment) query.shipment = filters.shipment;
  if (filters.container) query.container = filters.container;

  const allocations = await ShipmentContainerAllocation.find(query)
    .populate("shipment")
    .populate({ path: "container", populate: { path: "booking" } });

  if (hasSystemPermission(actingUser, "ALLOCATION_VIEW")) return allocations;

  return allocations.filter((allocation) => {
    try {
      assertCanViewAllocation(actingUser, allocation);
      return true;
    } catch (error) {
      return false;
    }
  });
}

async function getAllocationById(id, actingUser) {
  const allocation = await ShipmentContainerAllocation.findById(id)
    .populate("shipment")
    .populate({ path: "container", populate: { path: "booking" } });
  if (!allocation) throw notFound();

  assertCanViewAllocation(actingUser, allocation);
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

/**
 * True removal (see the model's comment for why there's no soft
 * delete here). Generates a SYSTEM ShipmentNote first, describing
 * the container/booking that was removed, so the fact that the
 * link once existed survives in the activity feed even though the
 * Allocation row itself is gone.
 */
async function removeAllocation(id, actingUser) {
  const current = await ShipmentContainerAllocation.findById(id).populate({
    path: "container",
    populate: { path: "booking" },
  });
  if (!current) throw notFound();

  const shipment = await loadShipmentOrThrow(current.shipment);
  assertCanOnShipment(actingUser, "ALLOCATION_DELETE", shipment);

  const containerLabel = current.container?.containerNumber || current.container?._id || "container";
  const bookingLabel = current.container?.booking?.bookingNumber;
  const message = bookingLabel
    ? `Container ${containerLabel} (booking ${bookingLabel}) removido deste embarque.`
    : `Container ${containerLabel} removido deste embarque.`;

  await shipmentNoteService.createSystemNote({
    shipment: current.shipment,
    message,
    container: current.container?._id || current.container,
    stage: current.stage,
  });

  await ShipmentContainerAllocation.findByIdAndDelete(id);
  return current;
}

module.exports = {
  createAllocation,
  listAllocations,
  getAllocationById,
  updateAllocation,
  removeAllocation,
};