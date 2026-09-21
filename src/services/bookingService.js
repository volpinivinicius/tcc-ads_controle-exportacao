const Booking = require("../models/booking");
const { assertCan } = require("./authorizationService");

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

async function createBooking(data, actingUser) {
  assertCan(actingUser, "BOOKING_CREATE", null);
  validateCutoffs(data);
  return Booking.create(data);
}

async function listBookings(actingUser, filters = {}) {
  assertCan(actingUser, "BOOKING_VIEW", null);
  const query = {};
  if (filters.carrier) query.carrier = filters.carrier;
  if (filters.isActive !== undefined && filters.isActive !== "") {
    query.isActive = filters.isActive === true || filters.isActive === "true";
  }
  return Booking.find(query);
}

async function getBookingById(id, actingUser) {
  assertCan(actingUser, "BOOKING_VIEW", null);
  const booking = await Booking.findById(id);
  if (!booking) throw notFound();
  return booking;
}

async function updateBooking(id, data, actingUser) {
  assertCan(actingUser, "BOOKING_UPDATE", null);
  const current = await Booking.findById(id);
  if (!current) throw notFound();

  validateCutoffs({
    cargoCutoff: data.cargoCutoff ?? current.cargoCutoff,
    documentCutoff: data.documentCutoff ?? current.documentCutoff,
    estimatedDeparture: data.estimatedDeparture ?? current.estimatedDeparture,
  });

  return Booking.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
}

async function deactivateBooking(id, actingUser) {
  assertCan(actingUser, "BOOKING_DELETE", null);
  const booking = await Booking.findByIdAndUpdate(id, { isActive: false }, { returnDocument: "after" });
  if (!booking) throw notFound();
  return booking;
}

async function reactivateBooking(id, actingUser) {
  assertCan(actingUser, "BOOKING_DELETE", null);
  const booking = await Booking.findByIdAndUpdate(id, { isActive: true }, { returnDocument: "after" });
  if (!booking) throw notFound();
  return booking;
}

/** True, permanent removal — System Administrator only. */
async function hardDeleteBooking(id, actingUser) {
  assertCan(actingUser, "BOOKING_DELETE", null);
  const booking = await Booking.findByIdAndDelete(id);
  if (!booking) throw notFound();
  return booking;
}

module.exports = {
  createBooking,
  listBookings,
  getBookingById,
  updateBooking,
  deactivateBooking,
  reactivateBooking,
  hardDeleteBooking,
};