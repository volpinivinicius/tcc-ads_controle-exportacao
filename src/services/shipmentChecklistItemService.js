/**
 * Shipment Checklist Item Service
 *
 * Contains the business logic related to a Shipment's document
 * checklist, such as validating the set of documents selected at
 * creation and handling completion of each item.
 *
 * When a Shipment Checklist Item is marked completed, generates
 * a corresponding SYSTEM ShipmentNote so the event is reflected
 * in the shipment's activity feed, and evaluates whether the
 * Shipment can move past status 5 (AWAITING_DOCUMENT_ISSUANCE),
 * based on whether any required document is still pending.
 *
 * Keeps this logic isolated from the Shipment Checklist Item
 * Controller.
 */