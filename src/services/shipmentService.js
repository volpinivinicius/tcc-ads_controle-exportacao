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
 * isGroupCompany flag) — a Shipment where neither is a group
 * Company is invalid and must be rejected — and controls the
 * assignment of other logistics chain participants, such as
 * carrier and warehouse, ensuring each is restricted to viewing
 * only the Shipments where their Company has been assigned that
 * responsibility. When the Shipment has separate exportStage and
 * importStage subdocuments, this restriction is resolved per
 * stage: a Company assigned as carrier or warehouse on the
 * exportStage only grants visibility into that stage, not into
 * the importStage, even when both stages belong to the same
 * Shipment. Responses returned to these Users are limited to the
 * stage(s) their Company is assigned to.
 *
 * Derives the Shipment's processType classification from the
 * isGroupCompany flag of its exporter and importer: EXPORT when
 * only the exporter is a group Company, IMPORT when only the
 * importer is a group Company, or INTERCOMPANY when both
 * exporter and importer are group Companies (e.g. two entities
 * of the same group in different countries). This classification
 * is a summary label for reports and dashboards; the operational
 * distinction between the export and import sides of the process
 * is handled separately by the stages below.
 *
 * For processes with two operational fronts, manages the
 * exportStage and importStage independently, so that the
 * responsible team, carrier, warehouse, status, and dates on
 * each side of the process can be updated without affecting the
 * other, while still deriving a single overall status for the
 * Shipment as a whole. This is what allows, for example, an
 * export team in Brazil and an import team in the United States
 * to operate on the same INTERCOMPANY Shipment.
 */