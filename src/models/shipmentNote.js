/**
 * Shipment Note Schema
 *
 * Represents an entry in a Shipment's activity feed, combining
 * system-generated notes and notes written by Users involved in
 * the process.
 *
 * A note has a type, SYSTEM or USER. SYSTEM notes are generated
 * automatically by the application, such as a status change or a
 * Booking deadline update affecting the Shipment through one of
 * its allocated Containers. USER notes are written manually by a
 * User and carry a visibility, PUBLIC or PRIVATE, so that
 * internal remarks are not necessarily exposed to Users with an
 * ASSIGNED_SHIPMENT AccessRole, such as external carriers or
 * warehouses.
 *
 * A note may optionally reference the Container or Booking it
 * relates to, so a SYSTEM note about a deadline change can point
 * to exactly which Container was affected, since a Shipment may
 * share only part of its Containers with a given Booking.
 */