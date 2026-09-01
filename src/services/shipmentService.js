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
 *
 * Validates that a Booking is only linked to a Shipment whose
 * modal is MARITIME, rejecting the link otherwise, and derives
 * whether a MARITIME Shipment is still awaiting its Booking from
 * the presence of that link, rather than from a status value.
 *
 * Enforces the Shipment's status sequence, but does not trigger
 * any transition automatically: in this first version, every
 * status change, for every value in the sequence, is a manual
 * action performed by a user, even when other data would suggest
 * the shipment is ready to move on (such as a Booking being
 * linked, a checklist item being completed, or cargo being
 * recorded as collected elsewhere). This service validates that
 * a manually requested transition is coherent with the sequence
 * — for example, that status 1 (AWAITING_INVOICE_RELEASE) and 2
 * (PARTIALLY_INVOICED) can alternate back and forth while cargo
 * is invoiced in more than one batch, only advancing to status 3
 * once invoicing is complete; that status 3
 * (AWAITING_COLLECTION_OR_SHIPPING) carries a meaning that
 * depends on the Shipment's modal (collection for ROAD/AIR,
 * vessel loading for MARITIME) without needing a separate status
 * value; that status 5 (AWAITING_DOCUMENT_ISSUANCE) is only a
 * valid choice if the Shipment Checklist still has a pending
 * item after shipping, and can be skipped otherwise; and that
 * status 6 (AWAITING_OWNERSHIP_TRANSFER) precedes status 7
 * (CLOSED), with its expected duration depending on the
 * Shipment's Incoterm.
 */