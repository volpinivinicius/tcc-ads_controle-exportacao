/**
 * Shipment Schema
 *
 * Represents a shipment process managed by the system.
 * A shipment establishes the relationship between an exporter,
 * an importer, and the users responsible for managing the process.
 *
 * The shipment status and related dates are used to track
 * the lifecycle of the shipment from opening to completion.
 *
 * Since a shipment's exporter and importer are not required to
 * belong to the same country, and both can be group Companies,
 * the shipment carries a processType classification derived from
 * the isGroupCompany flag of its exporter and importer:
 *
 * - EXPORT: only the exporter is a group Company.
 * - IMPORT: only the importer is a group Company.
 * - INTERCOMPANY: both exporter and importer are group Companies
 *   (e.g. two entities of the same group, in different countries).
 *
 * A shipment where neither exporter nor importer is a group
 * Company is invalid and must be rejected; at least one of the
 * two is always required to be a group Company. This
 * classification is what avoids ambiguity in reports and
 * dashboards, and it is a summary label for the process as a
 * whole, not a replacement for the operational distinction
 * between its export and import sides, which is instead captured
 * by the stages described below.
 *
 * For processes that involve two distinct operational fronts,
 * such as an INTERCOMPANY process handled by separate teams in
 * the origin and destination countries, the shipment carries two
 * optional subdocuments, exportStage and importStage. Each stage
 * holds the fields relevant to its side of the process
 * independently, including the responsible team/Company, the
 * assigned carrier, the assigned warehouse, status, and dates.
 * This allows, for instance, the export team in Brazil and the
 * import team in the United States to operate on the same
 * shipment record while each managing only their own stage,
 * including cases where the carrier used on the export leg
 * differs from the one used on the import leg.
 *
 * Shipments that are purely an EXPORT or an IMPORT, without a
 * separate operational front on the other side, are not required
 * to populate both stages; the fields can be kept at the
 * shipment's top level or within a single relevant stage. An
 * overall status, either stored or derived from the two stages,
 * provides a consolidated view of the shipment as a whole.
 *
 * A shipment is itself the commercial invoice for its process.
 * Its physical cargo is linked to one or more Containers through
 * the ShipmentContainerAllocation, which resolves the
 * many-to-many relationship between shipments and containers: a
 * container can carry cargo from more than one shipment, and a
 * shipment's cargo can be split across more than one container.
 * Containers are, in turn, linked to a Booking made with an
 * ocean carrier, whose deadlines apply uniformly to all of its
 * containers. See the Booking and Container schemas for details.
 *
 * A shipment also maintains an activity feed of ShipmentNotes,
 * combining system-generated entries (such as status changes or
 * a Booking deadline update affecting one of the shipment's
 * allocated containers) with notes written manually by users,
 * which can be marked public or private. See the ShipmentNote
 * schema for details.
 *
 * A shipment carries a modal field (MARITIME, AIR, ROAD, or
 * OTHER), identifying its transport mode. Only MARITIME shipments
 * may be linked to a Booking; a shipment with any other modal
 * must not have one. Whether a MARITIME shipment is still waiting
 * on its Booking is not tracked as a status value, but derived
 * from whether a Booking has been linked to it yet: the absence
 * of a linked Booking is itself the signal.
 *
 * The shipment's lifecycle is tracked through a status field.
 * In this first version, status changes are always made manually
 * by a user for every value in the sequence below; the system
 * does not transition status automatically based on other
 * events (such as a linked Booking, a completed checklist item,
 * or the cargo's collection/loading being recorded elsewhere).
 * Those events may inform the user of what to do next, but the
 * status change itself is a deliberate user action:
 *
 * - 0 NEW: the shipment has just been opened.
 * - 1 AWAITING_INVOICE_RELEASE / 2 PARTIALLY_INVOICED: these two
 *   can alternate back and forth, since cargo may become
 *   available and get invoiced in more than one batch over time;
 *   the shipment moves on only once invoicing is complete.
 * - 3 AWAITING_COLLECTION_OR_SHIPPING: reached once invoicing is
 *   complete. Its meaning depends on modal: for ROAD or AIR
 *   shipments it means awaiting cargo collection; for MARITIME
 *   shipments it means awaiting loading onto the vessel. It is a
 *   single shared status value regardless of modal.
 * - 4 SHIPPED: the cargo has been collected/loaded.
 * - 5 AWAITING_DOCUMENT_ISSUANCE: optional; used only when some
 *   required document is still pending after the shipment has
 *   occurred. If every required document was already issued
 *   before shipping, this status is skipped.
 * - 6 AWAITING_OWNERSHIP_TRANSFER: tracks the transfer of
 *   ownership as defined by the shipment's Incoterm; its
 *   duration depends on that Incoterm (for example, under DDP,
 *   ownership only transfers upon final delivery to the buyer).
 * - 7 CLOSED: the process is complete and ownership has
 *   transferred.
 *
 * Required documents for a shipment are tracked through a
 * dedicated checklist, not through ShipmentNotes: at the
 * shipment's creation, the user defines which documents that
 * process requires, and each item is tracked independently as
 * pending or completed. See the ShipmentChecklistItem schema for
 * details.
 *
 * Container pickup/return control and free time deadlines are
 * not duplicated on the shipment; they are represented only
 * through the Booking and Container the shipment is linked to.
 */