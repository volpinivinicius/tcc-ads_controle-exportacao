/**
 * Container Service
 *
 * Contains the business logic related to Containers, such as
 * validating their association with a Booking and their
 * size/type, before and after the containerNumber becomes known.
 *
 * Validates that Users updating a Container's containerNumber or
 * realized operational dates, when acting under an
 * ASSIGNED_SHIPMENT AccessRole, are restricted to Containers
 * allocated to Shipments their Company is responsible for.
 *
 * Keeps this logic isolated from the Container Controller.
 */