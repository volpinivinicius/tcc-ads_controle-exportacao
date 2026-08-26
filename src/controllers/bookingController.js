/**
 * Booking Controller
 *
 * Manages the creation, retrieval, update, and removal of
 * Bookings made with ocean carriers.
 *
 * Handles the registration of the booking's vessel, voyage,
 * ports, estimated dates, and deadlines (cargo cutoff, document
 * cutoff), which apply uniformly to every Container linked to
 * the Booking.
 *
 * Updating a Booking's deadlines is what triggers the propagation
 * of a SYSTEM ShipmentNote to every Shipment allocated to any of
 * the Booking's Containers, notifying the change. See the
 * Shipment Note Controller for details.
 */