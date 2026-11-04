const mongoose = require("mongoose");

/**
 * Append-only activity feed entry for a Shipment: no update, no
 * delete — the feed IS the Shipment's history, consistent with
 * the project's "never lose history" principle. See README >
 * Shipment activity feed.
 *
 * type: SYSTEM (auto-generated, e.g. a Booking deadline change)
 * or USER (written manually). visibility: PUBLIC or PRIVATE —
 * PRIVATE hides the note from ASSIGNED_SHIPMENT viewers (external
 * carriers/warehouses), but not from SYSTEM/COMPANY viewers.
 *
 * stage: which of the Shipment's operational fronts this note
 * relates to (mirrors ShipmentContainerAllocation.stage). An
 * ASSIGNED_SHIPMENT viewer only sees notes whose stage matches
 * the one they're assigned to; a note with no stage is treated
 * as internal/general and is not shown to ASSIGNED_SHIPMENT
 * viewers at all, regardless of visibility.
 *
 * container/booking: optional context for SYSTEM notes, so a
 * deadline-change note can point to exactly which Container/
 * Booking triggered it.
 */
const shipmentNoteSchema = new mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },
    type: { type: String, enum: ["SYSTEM", "USER"], required: true },
    visibility: {
      type: String,
      enum: ["PUBLIC", "PRIVATE"],
      required: true,
      default: "PUBLIC",
    },
    stage: { type: String, enum: ["EXPORT", "IMPORT"] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true, trim: true },
    container: { type: mongoose.Schema.Types.ObjectId, ref: "Container" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShipmentNote", shipmentNoteSchema);