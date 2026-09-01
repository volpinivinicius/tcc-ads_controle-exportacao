/**
 * Shipment Controller
 *
 * Manages the creation, retrieval, update, and removal of
 * Shipments processed within the system.
 *
 * Coordinates the relationship between the exporting Company,
 * the importing Company, and the Users responsible for the
 * process, tracking the Shipment's status and relevant dates
 * throughout its lifecycle.
 *
 * Also manages the assignment of other logistics chain
 * participants to a Shipment, such as the responsible carrier
 * or warehouse, which the Service Center can update at any point
 * of the process to control which external users are able to
 * view that Shipment. When the process has separate operational
 * fronts, these assignments are handled independently within the
 * exportStage and importStage subdocuments, allowing, for
 * example, different carriers on the export and import legs.
 *
 * Exposes the Shipment's processType classification (EXPORT,
 * IMPORT, or INTERCOMPANY), derived from whether its exporter
 * and/or importer are group Companies, for use in reports and
 * dashboards, together with the overall status consolidated from
 * both stages when applicable.
 *
 * Handles the Shipment's modal (MARITIME, AIR, ROAD, or OTHER)
 * and its 8-step status lifecycle (0 NEW through 7 CLOSED). In
 * this first version, every status change is made manually by a
 * user, including advancing past status 1/2 (which can alternate
 * during partial invoicing) and skipping status 5 when no
 * required document is pending after shipping; the system does
 * not transition status automatically. A Booking can only be
 * linked to MARITIME Shipments; whether such a Shipment is still
 * awaiting its Booking is derived from that link rather than
 * tracked as a separate status.
 *
 * Also manages the Shipment's document checklist, letting the
 * user define which documents are required at creation and
 * exposing their completion state. See the Shipment Checklist
 * Item Controller for details.
 */