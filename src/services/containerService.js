/**
 * BASIC version — see the model's comment for the deferred
 * ASSIGNED_SHIPMENT delegation (depends on
 * ShipmentContainerAllocation, a future increment). Entirely
 * SYSTEM-only for now, same as Booking.
 */

const Container = require("../models/container");
const Booking = require("../models/booking");
const { assertCan } = require("./authorizationService");

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

async function createContainer(data, actingUser) {
  assertCan(actingUser, "CONTAINER_CREATE", null);
  await validateBooking(data.booking);
  return Container.create(data);
}

/** filters (all optional): booking (id), isActive ("true"/"false"). */
async function listContainers(actingUser, filters = {}) {
  assertCan(actingUser, "CONTAINER_VIEW", null);
  const query = {};
  if (filters.booking) query.booking = filters.booking;
  if (filters.isActive !== undefined && filters.isActive !== "") {
    query.isActive = filters.isActive === true || filters.isActive === "true";
  }
  return Container.find(query).populate("booking");
}

async function getContainerById(id, actingUser) {
  assertCan(actingUser, "CONTAINER_VIEW", null);
  const container = await Container.findById(id).populate("booking");
  if (!container) throw notFound();
  return container;
}

async function updateContainer(id, data, actingUser) {
  assertCan(actingUser, "CONTAINER_UPDATE", null);
  if (data.booking) await validateBooking(data.booking);

  const container = await Container.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!container) throw notFound();
  return container;
}

async function deactivateContainer(id, actingUser) {
  assertCan(actingUser, "CONTAINER_DELETE", null);
  const container = await Container.findByIdAndUpdate(id, { isActive: false }, { returnDocument: "after" });
  if (!container) throw notFound();
  return container;
}

async function reactivateContainer(id, actingUser) {
  assertCan(actingUser, "CONTAINER_DELETE", null);
  const container = await Container.findByIdAndUpdate(id, { isActive: true }, { returnDocument: "after" });
  if (!container) throw notFound();
  return container;
}

/** True, permanent removal — System Administrator only. */
async function hardDeleteContainer(id, actingUser) {
  assertCan(actingUser, "CONTAINER_DELETE", null);
  const container = await Container.findByIdAndDelete(id);
  if (!container) throw notFound();
  return container;
}

module.exports = {
  createContainer,
  listContainers,
  getContainerById,
  updateContainer,
  deactivateContainer,
  reactivateContainer,
  hardDeleteContainer,
};