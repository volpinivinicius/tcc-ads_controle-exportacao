/**
 * Shipment Container Allocation Service
 *
 * Contains the business logic related to allocating Shipments to
 * Containers, such as validating that the allocated volume,
 * weight, or quantity is consistent with the Container's
 * capacity and the Shipment's cargo.
 *
 * Is also the basis for resolving ASSIGNED_SHIPMENT visibility
 * for Container-related data: a Company assigned as carrier or
 * warehouse for a Shipment gains visibility into the Containers
 * that Shipment is allocated to, through this association.
 *
 * Keeps this logic isolated from the Shipment Container
 * Allocation Controller.
 */