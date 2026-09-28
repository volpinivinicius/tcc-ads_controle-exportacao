/**
 * See the model's comment for the general design.
 *
 * Authorization: CREATE/UPDATE/DELETE remain SYSTEM-only — a
 * carrier doesn't manage the Booking itself, only Container data
 * (see containerService). VIEW extends to ASSIGNED_SHIPMENT,
 * resolved one hop further out than Container: a Company
 * assigned as carrier/warehouse on the relevant stage of any
 * Shipment allocated to any Container under this Booking.
 *
 * A deadline change (cargoCutoff, documentCutoff,
 * estimatedDeparture, estimatedArrival) generates a SYSTEM
 * ShipmentNote on every Shipment allocated to any of this
 * Booking's Containers, tagged with the allocation's own stage —
 * closing the propagation the project's original design called
 * for.
 */

const Booking = require("../models/booking");
const Container = require("../models/container");
const ShipmentContainerAllocation = require("../models/shipmentContainerAllocation");
const {
  hasSystemPermission,
  hasAssignedShipmentPermission,
  assignedShipmentCompanyIds,
  forbidden,
} = require("./authorizationService");
const { getAssignedCompanyIdsForContainer } = require("./containerService");
const shipmentNoteService = require("./shipmentNoteService");

const DEADLINE_FIELDS = ["cargoCutoff", "documentCutoff", "estimatedDeparture", "estimatedArrival"];

function notFound() {
  const error = new Error("Booking not found");
  error.status = 404;
  return error;
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function validateCutoffs({ cargoCutoff, documentCutoff, estimatedDeparture }) {
  if (!estimatedDeparture) return;
  const etd = new Date(estimatedDeparture);
  if (cargoCutoff && new Date(cargoCutoff) > etd) {
    throw badRequest("cargoCutoff cannot be after estimatedDeparture");
  }
  if (documentCutoff && new Date(documentCutoff) > etd) {
    throw badRequest("documentCutoff cannot be after estimatedDeparture");
  }
}

function deadlineFieldsChanged(before, after) {
  return DEADLINE_FIELDS.some((field) => {
    if (after[field] === undefined) return false;
    const a = before[field] ? new Date(before[field]).getTime() : null;
    const b = after[field] ? new Date(after[field]).getTime() : null;
    return a !== b;
  });
}

async function notifyDeadlineChange(booking) {
  const containers = await Container.find({ booking: booking._id });
  for (const container of containers) {
    const allocations = await ShipmentContainerAllocation.find({
      container: container._id,
      isActive: true,
    });
    for (const allocation of allocations) {
      await shipmentNoteService.createSystemNote({
        shipment: allocation.shipment,
        message: `Prazo do booking ${booking.bookingNumber} foi atualizado (container ${container.containerNumber || container._id}).`,
        container: container._id,
        booking: booking._id,
        stage: allocation.stage,
      });
    }
  }
}

async function getAssignedCompanyIdsForBooking(bookingId) {
  const containers = await Container.find({ booking: bookingId });
  const idSet = new Set();
  for (const container of containers) {
    const ids = await getAssignedCompanyIdsForContainer(container._id);
    ids.forEach((id) => idSet.add(String(id)));
  }
  return [...idSet];
}

async function assertCanViewBooking(user, bookingId) {
  if (hasSystemPermission(user, "BOOKING_VIEW")) return;
  const assignedIds = await getAssignedCompanyIdsForBooking(bookingId);
  if (hasAssignedShipmentPermission(user, "BOOKING_VIEW", assignedIds)) return;
  throw forbidden();
}

async function createBooking(data, actingUser) {
  if (!hasSystemPermission(actingUser, "BOOKING_CREATE")) throw forbidden();
  validateCutoffs(data);
  return Booking.create(data);
}

/** filters (all optional): carrier, isActive ("true"/"false"). */
async function listBookings(actingUser, filters = {}) {
  const query = {};
  if (filters.carrier) query.carrier = filters.carrier;
  if (filters.isActive !== undefined && filters.isActive !== "") {
    query.isActive = filters.isActive === true || filters.isActive === "true";
  }

  if (hasSystemPermission(actingUser, "BOOKING_VIEW")) {
    return Booking.find(query);
  }

  const assignedIds = assignedShipmentCompanyIds(actingUser, "BOOKING_VIEW");
  if (assignedIds.length === 0) throw forbidden();

  const allBookings = await Booking.find(query);
  const visible = [];
  for (const booking of allBookings) {
    const bookingAssignedIds = await getAssignedCompanyIdsForBooking(booking._id);
    if (bookingAssignedIds.some((id) => assignedIds.includes(String(id)))) {
      visible.push(booking);
    }
  }
  return visible;
}

async function getBookingById(id, actingUser) {
  await assertCanViewBooking(actingUser, id);
  const booking = await Booking.findById(id);
  if (!booking) throw notFound();
  return booking;
}

async function updateBooking(id, data, actingUser) {
  if (!hasSystemPermission(actingUser, "BOOKING_UPDATE")) throw forbidden();
  const current = await Booking.findById(id);
  if (!current) throw notFound();

  validateCutoffs({
    cargoCutoff: data.cargoCutoff ?? current.cargoCutoff,
    documentCutoff: data.documentCutoff ?? current.documentCutoff,
    estimatedDeparture: data.estimatedDeparture ?? current.estimatedDeparture,
  });

  const shouldNotify = deadlineFieldsChanged(current, data);

  const booking = await Booking.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });

  if (shouldNotify) {
    await notifyDeadlineChange(booking);
  }

  return booking;
}

async function deactivateBooking(id, actingUser) {
  if (!hasSystemPermission(actingUser, "BOOKING_DELETE")) throw forbidden();
  const booking = await Booking.findByIdAndUpdate(id, { isActive: false }, { returnDocument: "after" });
  if (!booking) throw notFound();
  return booking;
}

async function reactivateBooking(id, actingUser) {
  if (!hasSystemPermission(actingUser, "BOOKING_DELETE")) throw forbidden();
  const booking = await Booking.findByIdAndUpdate(id, { isActive: true }, { returnDocument: "after" });
  if (!booking) throw notFound();
  return booking;
}

/** True, permanent removal — System Administrator only. */
async function hardDeleteBooking(id, actingUser) {
  if (!hasSystemPermission(actingUser, "BOOKING_DELETE")) throw forbidden();
  const booking = await Booking.findByIdAndDelete(id);
  if (!booking) throw notFound();
  return booking;
}

/**
 * Internal helper for the Shipment-allocation workflow ONLY — same
 * reasoning as containerService.listContainersForBooking: lets the
 * "pick a Booking" dropdown render for whoever can legitimately
 * allocate to a Shipment (e.g. a COMPANY-scope operator), not only
 * SYSTEM/ASSIGNED_SHIPMENT. Exposes only bookingNumber/carrier.
 */
async function listBookingsForSelection() {
  return Booking.find({ isActive: true }).select("bookingNumber carrier");
}

module.exports = {
  createBooking,
  listBookings,
  getBookingById,
  updateBooking,
  deactivateBooking,
  reactivateBooking,
  hardDeleteBooking,
  listBookingsForSelection,
};