/**
 * Booking Schema
 *
 * Represents a booking made with an ocean carrier for a shipment
 * reservation, identified by a single booking number shared by
 * all Containers registered under it.
 *
 * Records the vessel, voyage, port of loading and discharge,
 * estimated departure and arrival dates, and the deadlines (such
 * as cargo cutoff and document cutoff) that apply to the booking
 * as a whole. These deadlines are not duplicated per Container;
 * every Container linked to a Booking shares the same deadlines.
 *
 * At the time a Booking is created, only the requested container
 * quantity and type are known (e.g. four 20ft containers); the
 * specific Containers, including their container numbers, are
 * registered progressively as empty containers are picked up
 * from the depot. See the Container schema for details.
 */