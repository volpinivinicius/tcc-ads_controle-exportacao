/**
 * Booking Service
 *
 * Contains the business logic related to Bookings, such as
 * validating vessel, voyage, port, and deadline data before
 * persisting changes.
 *
 * When a Booking's deadlines are updated, propagates a SYSTEM
 * ShipmentNote to every Shipment currently allocated (through
 * the ShipmentContainerAllocation) to any of the Booking's
 * Containers, since a deadline change on the Booking applies to
 * all of its Containers and may affect Shipments that only share
 * part of their cargo with that Booking.
 *
 * Keeps this logic isolated from the Booking Controller.
 */