/**
 * Shipment Service
 *
 * Contains the business logic related to Shipments, such as
 * validating the relationship between the exporting Company,
 * the importing Company, and the Users responsible for the
 * process.
 *
 * Manages the transitions of the Shipment's status and related
 * dates throughout its lifecycle, keeping this logic isolated
 * from the Shipment Controller.
 *
 * Validates that a Shipment's exporter and importer always
 * include at least one group Company (identified by the
 * isIntercompany flag), and controls the assignment of other
 * logistics chain participants, such as carrier and warehouse,
 * ensuring each is restricted to viewing only the Shipments
 * where their Company has been assigned that responsibility.
 *
 * Derives the Shipment's process classification from the
 * isIntercompany flag of its exporter and importer: an export
 * when only the exporter is a group Company, an import when only
 * the importer is a group Company, or an intercompany/global
 * process when both exporter and importer are group Companies
 * (e.g. Randon Corp entities in different countries).
 *
 * For processes with two operational fronts, manages the
 * exportStage and importStage independently, so that the
 * responsible team, carrier, warehouse, status, and dates on
 * each side of the process can be updated without affecting the
 * other, while still deriving a single overall status for the
 * Shipment as a whole. This is what allows, for example, an
 * export team in Brazil and an import team in the United States
 * to operate on the same intercompany/global Shipment.
 */