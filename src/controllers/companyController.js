/**
 * Company Controller
 *
 * Manages the creation, retrieval, update, and removal of
 * Companies registered in the system.
 *
 * Handles the definition of a Company's business roles
 * (Exporter, Importer, or both) and type (regular Company or
 * Service Center), which determine how the organization
 * participates in Shipments and is managed within the system.
 *
 * Exporter, Importer, and Service Center are the initial types
 * supported by the project. The controller is designed to
 * accommodate future participants of the logistics process,
 * such as carriers and warehousing companies, as the system
 * grows to cover the full shipment chain.
 *
 * Also exposes the isIntercompany flag, which lets the Service
 * Center distinguish Companies belonging to its corporate group
 * from external Companies it only relates to through Shipments, 
 * such as foreign buyers or third-party carriers and warehouses.
 */