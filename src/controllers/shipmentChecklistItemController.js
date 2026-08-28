/**
 * Shipment Checklist Item Controller
 *
 * Manages the creation, retrieval, update, and removal of the
 * document checklist items belonging to a Shipment.
 *
 * Supports defining which documents a Shipment requires at
 * creation time, and marking each item as completed as the
 * process progresses. Access to update a Shipment Checklist Item
 * follows the same AccessRole scope rules as the rest of the
 * Shipment (SYSTEM, COMPANY, or ASSIGNED_SHIPMENT, resolved per
 * stage for INTERCOMPANY Shipments where applicable).
 */