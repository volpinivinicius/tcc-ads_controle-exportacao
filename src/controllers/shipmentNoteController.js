/**
 * Shipment Note Controller
 *
 * Manages the creation, retrieval, update, and removal of notes
 * in a Shipment's activity feed.
 *
 * Enforces that USER notes marked as PRIVATE are only visible to
 * Users authorized to see private notes for that Shipment, while
 * PUBLIC notes and SYSTEM notes are visible to any User with
 * access to the Shipment, respecting their AccessRole's scope
 * (SYSTEM, COMPANY, or ASSIGNED_SHIPMENT, including the per-stage
 * restriction for INTERCOMPANY Shipments).
 */