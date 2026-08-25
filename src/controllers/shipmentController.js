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
 * Exposes the Shipment's process classification (export, import,
 * or intercompany/global process), derived from whether its
 * exporter and/or importer are group Companies, for use in
 * reports and dashboards, together with the overall status
 * consolidated from both stages when applicable.
 */