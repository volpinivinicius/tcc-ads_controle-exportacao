/**
 * Routes Index
 *
 * Aggregates all the application's route modules and exposes
 * them through a single entry point, mounted by the main
 * Express application.
 *
 * Each resource has its own route module, kept isolated here
 * for organization and maintainability, including the shipment
 * lifecycle resources introduced alongside Shipment itself
 * (Booking, Container, Shipment Container Allocation, and
 * Shipment Note).
 *
 * Protected routes rely on the Auth and Permission middlewares
 * to ensure that only authenticated and authorized users can
 * reach the corresponding controllers, respecting each User's
 * AccessRole scope (SYSTEM, COMPANY, or ASSIGNED_SHIPMENT).
 */