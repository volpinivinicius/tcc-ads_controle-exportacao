/**
 * See the model's comment for the general design.
 *
 * Authorization: CREATE and DELETE (deactivate/hard-delete)
 * remain SYSTEM-only. VIEW and UPDATE extend to ASSIGNED_SHIPMENT
 * — a Company assigned as carrier/warehouse on the stage of any
 * Shipment this Container is allocated to (via
 * ShipmentContainerAllocation, matching the allocation's own
 * `stage`) can view and update the Container — this is what lets
 * a carrier's User fill in the containerNumber once the physical
 * container is picked up, per the original design.
 */

const Container = require("../models/container");
const Booking = require("../models/booking");
const ShipmentContainerAllocation = require("../models/shipmentContainerAllocation");
const {
  hasSystemPermission,
  hasAssignedShipmentPermission,
  assignedShipmentCompanyIds,
  forbidden,
} = require("./authorizationService");

function notFound() {
  const error = new Error("Container not found");
  error.status = 404;
  return error;
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function validateBooking(bookingId) {
  const exists = await Booking.exists({ _id: bookingId });
  if (!exists) throw badRequest("Booking not found");
}

/**
 * Every carrier/warehouse Company assigned to the stage(s)
 * relevant to this Container, across all of its active
 * allocations. Exported for bookingService, which needs the same
 * resolution one hop further out (Booking -> its Containers).
 */
async function getAssignedCompanyIdsForContainer(containerId) {
  const allocations = await ShipmentContainerAllocation.find({
    container: containerId,
    isActive: true,
  }).populate("shipment");

  const ids = [];
  for (const allocation of allocations) {
    const shipment = allocation.shipment;
    if (!shipment) continue;
    if (!allocation.stage || allocation.stage === "EXPORT") {
      if (shipment.exportStage?.carrierCompany) ids.push(shipment.exportStage.carrierCompany);
      if (shipment.exportStage?.warehouseCompany) ids.push(shipment.exportStage.warehouseCompany);
    }
    if (!allocation.stage || allocation.stage === "IMPORT") {
      if (shipment.importStage?.carrierCompany) ids.push(shipment.importStage.carrierCompany);
      if (shipment.importStage?.warehouseCompany) ids.push(shipment.importStage.warehouseCompany);
    }
  }
  return ids;
}

async function assertCanAccessContainer(user, containerId, code) {
  if (hasSystemPermission(user, code)) return;
  const assignedIds = await getAssignedCompanyIdsForContainer(containerId);
  if (hasAssignedShipmentPermission(user, code, assignedIds)) return;
  throw forbidden();
}

async function createContainer(data, actingUser) {
  if (!hasSystemPermission(actingUser, "CONTAINER_CREATE")) throw forbidden();
  await validateBooking(data.booking);
  return Container.create(data);
}

/** filters (all optional): booking (id), isActive ("true"/"false"). */
async function listContainers(actingUser, filters = {}) {
  const query = {};
  if (filters.booking) query.booking = filters.booking;
  if (filters.isActive !== undefined && filters.isActive !== "") {
    query.isActive = filters.isActive === true || filters.isActive === "true";
  }

  if (hasSystemPermission(actingUser, "CONTAINER_VIEW")) {
    return Container.find(query).populate("booking");
  }

  const assignedIds = assignedShipmentCompanyIds(actingUser, "CONTAINER_VIEW");
  if (assignedIds.length === 0) throw forbidden();

  const allocations = await ShipmentContainerAllocation.find({ isActive: true }).populate("shipment");
  const visibleContainerIds = new Set();
  for (const allocation of allocations) {
    const shipment = allocation.shipment;
    if (!shipment) continue;
    const relevant = [];
    if (!allocation.stage || allocation.stage === "EXPORT") {
      relevant.push(String(shipment.exportStage?.carrierCompany), String(shipment.exportStage?.warehouseCompany));
    }
    if (!allocation.stage || allocation.stage === "IMPORT") {
      relevant.push(String(shipment.importStage?.carrierCompany), String(shipment.importStage?.warehouseCompany));
    }
    if (relevant.some((id) => assignedIds.includes(id))) {
      visibleContainerIds.add(String(allocation.container));
    }
  }

  query._id = { $in: [...visibleContainerIds] };
  return Container.find(query).populate("booking");
}

async function getContainerById(id, actingUser) {
  await assertCanAccessContainer(actingUser, id, "CONTAINER_VIEW");
  const container = await Container.findById(id).populate("booking");
  if (!container) throw notFound();
  return container;
}

async function updateContainer(id, data, actingUser) {
  await assertCanAccessContainer(actingUser, id, "CONTAINER_UPDATE");
  if (data.booking) await validateBooking(data.booking);

  const container = await Container.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!container) throw notFound();
  return container;
}

async function deactivateContainer(id, actingUser) {
  if (!hasSystemPermission(actingUser, "CONTAINER_DELETE")) throw forbidden();
  const container = await Container.findByIdAndUpdate(id, { isActive: false }, { returnDocument: "after" });
  if (!container) throw notFound();
  return container;
}

async function reactivateContainer(id, actingUser) {
  if (!hasSystemPermission(actingUser, "CONTAINER_DELETE")) throw forbidden();
  const container = await Container.findByIdAndUpdate(id, { isActive: true }, { returnDocument: "after" });
  if (!container) throw notFound();
  return container;
}

/** True, permanent removal — System Administrator only. */
async function hardDeleteContainer(id, actingUser) {
  if (!hasSystemPermission(actingUser, "CONTAINER_DELETE")) throw forbidden();
  const container = await Container.findByIdAndDelete(id);
  if (!container) throw notFound();
  return container;
}

/**
 * Internal helper for the Shipment-allocation workflow ONLY — lists
 * a Booking's active Containers without the general VIEW gate above.
 * Safe because the data exposed here (container size/number/dates)
 * is low-sensitivity, and the actual allocation is still properly
 * authorized inside allocationService.createAllocation when it's
 * created — this just lets the picker render for whoever can
 * legitimately reach that action (e.g. a COMPANY-scope operator
 * managing their own Shipment), not only SYSTEM/ASSIGNED_SHIPMENT.
 * Not exposed through any route — do not call this to answer a
 * general "can this user view this container" question.
 */
async function listContainersForBooking(bookingId) {
  return Container.find({ booking: bookingId, isActive: true }).populate("booking");
}

module.exports = {
  createContainer,
  listContainers,
  getContainerById,
  updateContainer,
  deactivateContainer,
  reactivateContainer,
  hardDeleteContainer,
  getAssignedCompanyIdsForContainer,
  listContainersForBooking,
};