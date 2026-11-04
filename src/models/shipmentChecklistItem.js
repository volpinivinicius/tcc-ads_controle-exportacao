const mongoose = require("mongoose");

/**
 * A single document requirement within a Shipment's checklist.
 * The set of required documents is not fixed by the system — the
 * user defines which ones a given Shipment needs. Tracks the
 * requirement itself, not the document's file content.
 *
 * Marking an item COMPLETED generates a SYSTEM ShipmentNote (see
 * shipmentChecklistItemService), so the event is also visible in
 * the shipment's activity history — the checklist item itself can
 * be deleted if no longer needed (e.g. added by mistake) without
 * losing that history, since the completion event already lives
 * in the note.
 *
 * Whether Shipment status 5 (AWAITING_DOCUMENT_ISSUANCE) applies
 * depends on whether any item is still PENDING — exposed as a
 * helper for the UI/future increments; status changes remain
 * manual, per the project's status-transition rule.
 */
const shipmentChecklistItemSchema = new mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },
    documentName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      required: true,
      default: "PENDING",
    },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShipmentChecklistItem", shipmentChecklistItemSchema);