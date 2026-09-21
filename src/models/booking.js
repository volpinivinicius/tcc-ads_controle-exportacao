const mongoose = require("mongoose");

const requestedContainerSchema = new mongoose.Schema(
  {
    size: { type: String, enum: ["20FT", "40FT", "40HC"], required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: { type: String, required: true, unique: true, trim: true },
    carrier: { type: String, required: true, trim: true },
    vessel: { type: String, trim: true },
    voyage: { type: String, trim: true },
    portOfLoading: { type: String, required: true, trim: true },
    portOfDischarge: { type: String, required: true, trim: true },
    estimatedDeparture: { type: Date },
    estimatedArrival: { type: Date },
    cargoCutoff: { type: Date },
    documentCutoff: { type: Date },
    requestedContainers: {
      type: [requestedContainerSchema],
      required: true,
      validate: (arr) => arr.length > 0,
    },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);