/**
 * Shipment Checklist Item Schema
 *
 * Represents a single document requirement within a Shipment's
 * document checklist, such as a Bill of Lading, Certificate of
 * Origin, or export declaration.
 *
 * The set of required documents for a Shipment is not fixed by
 * the system; it is defined by the user at the Shipment's
 * creation, who selects which documents that particular process
 * will require. Each Shipment Checklist Item tracks its own
 * status, pending or completed, along with who completed it and
 * when. It tracks the requirement itself, not the document's
 * file content; attaching the actual file is a separate concern.
 *
 * This checklist exists as a dedicated structure, separate from
 * ShipmentNote, so that document tracking can be queried and
 * displayed as a simple checklist rather than parsed out of a
 * free-form activity feed. A completed Shipment Checklist Item
 * may still generate a corresponding SYSTEM ShipmentNote, so the
 * event is also visible in the shipment's activity history.
 *
 * Whether a Shipment can reach status 5
 * (AWAITING_DOCUMENT_ISSUANCE) after shipping depends on whether
 * any Shipment Checklist Item is still pending at that point; if
 * every required document was already completed before shipping,
 * that status is skipped.
 */