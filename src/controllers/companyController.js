/**
 * Company Controller
 *
 * Manages the creation, retrieval, update, and removal of
 * Companies registered in the system.
 *
 * Handles the definition of a Company's business roles
 * (Exporter, Importer, or both), which determine how the
 * organization participates in Shipments.
 *
 * Exporter and Importer are the initial roles supported by the
 * project. The controller is designed to accommodate future
 * participants of the logistics process, such as carriers and
 * warehousing companies, as the system grows to cover the full
 * shipment chain.
 *
 * Also exposes the isIntercompany flag, which distinguishes
 * Companies belonging to the corporate group from external
 * Companies it only relates to through Shipments, such as
 * foreign buyers or third-party carriers and warehouses.
 *
 * Does not expose a "Service Center" role or type: the Service
 * Center is a team hosted within one of the group's own
 * Companies, represented through AccessRole scope rather than
 * Company data. See the Access Role Controller for details.
 */