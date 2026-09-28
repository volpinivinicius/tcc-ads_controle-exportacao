const mongoose = require("mongoose");

/**
 * BASIC version — see the model's original design comment.
 * Authorization is SYSTEM-only for now, same reasoning as
 * Booking: the ASSIGNED_SHIPMENT delegation described in the
 * original design (a carrier's user updating the
 * containerNumber/realized dates for containers allocated to
 * their assigned Shipments) depends on
 * ShipmentContainerAllocation, a future increment. Revisit
 * CONTAINER_UPDATE's authorization once that exists.
 */
const containerSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    size: { type: String, enum: ["20FT", "40FT", "40HC"], required: true },
    containerNumber: { type: String, trim: true, unique: true, sparse: true },
    emptyPickupDate: { type: Date },
    gateInDate: { type: Date },
    returnDate: { type: Date },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Container", containerSchema);