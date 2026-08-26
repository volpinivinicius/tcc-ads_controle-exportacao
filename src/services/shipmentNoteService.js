/**
 * Shipment Note Service
 *
 * Contains the business logic related to Shipment notes,
 * including the creation of SYSTEM notes triggered by other
 * services, such as a status change on the Shipment or a
 * deadline update on a Booking whose Containers are allocated to
 * the Shipment.
 *
 * Validates the visibility rules for USER notes (PUBLIC or
 * PRIVATE) and ensures SYSTEM notes always carry enough context
 * (such as the related Container or Booking) to be meaningful to
 * whoever reads the Shipment's activity feed.
 *
 * Keeps this logic isolated from the Shipment Note Controller.
 */