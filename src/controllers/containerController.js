/**
 * Container Controller
 *
 * Manages the creation, retrieval, update, and removal of
 * Containers linked to a Booking.
 *
 * Supports registering a Container before its containerNumber is
 * known (with only size/type defined), and later updating it
 * once the physical container is picked up from the depot. This
 * update is frequently performed by a User of the carrier or
 * logistics operator responsible for the pickup, scoped through
 * an ASSIGNED_SHIPMENT AccessRole tied to the Shipments the
 * Container is allocated to.
 *
 * Also manages the Container's realized operational dates (empty
 * pickup, gate-in, return), independent of the Booking's
 * deadlines, which apply uniformly to all Containers of that
 * Booking.
 */