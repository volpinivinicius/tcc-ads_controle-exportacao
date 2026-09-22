const mongoose = require("mongoose");

/**
 * BASIC version — see the model's original design comment
 * (resolves the N:N relationship between Shipment and Container).
 *
 * A given (shipment, container) pair is unique — to change the
 * allocated weight/volume, update the existing record rather
 * than creating a duplicate. No "quantity" field: a Container is
 * a single physical unit, so counting it doesn't apply here —
 * weightKg/volumeM3 already express how much of the Shipment's
 * cargo occupies it, for the case where the container is shared
 * with another Shipment.
 *
 * ASSIGNED_SHIPMENT visibility (a carrier/warehouse Company
 * seeing only the Containers its assigned Shipments are
 * allocated to) is deferred: it depends on the Shipment knowing
 * which Company is its assigned carrier/warehouse, which lives in
 * exportStage/importStage — not yet implemented. For now,
 * authorization follows the same rule as Shipment itself
 * (exporter OR importer company, or SYSTEM).
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
    weightKg: { type: Number, min: 0 },
    volumeM3: { type: Number, min: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

shipmentContainerAllocationSchema.index({ shipment: 1, container: 1 }, { unique: true });

module.exports = mongoose.model(
  "ShipmentContainerAllocation",
  shipmentContainerAllocationSchema
);