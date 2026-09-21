/**
 * BASIC CRUD for Booking. See bookingService — entirely
 * SYSTEM-only for now. "delete" deactivates; "hardDelete"
 * performs true removal.
 */

const bookingService = require("../services/bookingService");

async function create(req, res, next) {
  try {
    const booking = await bookingService.createBooking(req.body, req.user);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const filters = { carrier: req.query.carrier, isActive: req.query.isActive };
    const bookings = await bookingService.listBookings(req.user, filters);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const booking = await bookingService.updateBooking(req.params.id, req.body, req.user);
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function deactivate(req, res, next) {
  try {
    const booking = await bookingService.deactivateBooking(req.params.id, req.user);
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function reactivate(req, res, next) {
  try {
    const booking = await bookingService.reactivateBooking(req.params.id, req.user);
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

async function hardDelete(req, res, next) {
  try {
    await bookingService.hardDeleteBooking(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, getById, update, deactivate, reactivate, hardDelete };