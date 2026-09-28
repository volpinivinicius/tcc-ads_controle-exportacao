const mongoose = require("mongoose");

/**
 * Resolves the N:N relationship between Shipment and Container.
 * No "quantity" field: a Container is a single physical unit, so
 * counting it doesn't apply here — weightKg/volumeM3 already
 * express how much of the Shipment's cargo occupies it, for the
 * case where the container is shared with another Shipment.
 *
 * stage: which of the Shipment's operational fronts (see
 * exportStage/importStage on Shipment) this allocation belongs
 * to. Required whenever the Shipment has both stages populated
 * (INTERCOMPANY with two fronts) — otherwise ambiguous which
 * stage's ASSIGNED_SHIPMENT carrier/warehouse it should resolve
 * against. Optional/irrelevant for a Shipment with only one
 * stage populated. A (shipment, container, stage) triple is
 * unique, allowing the rare case of the same physical container
 * appearing on both fronts of an INTERCOMPANY shipment as two
 * separate allocation records.
 */
const shipmentContainerAllocationSchema = new mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },
    container: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Container",
      required: true,
    },
    stage: { type: String, enum: ["EXPORT", "IMPORT"] },
    weightKg: { type: Number, min: 0 },
    volumeM3: { type: Number, min: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

shipmentContainerAllocationSchema.index(
  { shipment: 1, container: 1, stage: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ShipmentContainerAllocation",
  shipmentContainerAllocationSchema
);