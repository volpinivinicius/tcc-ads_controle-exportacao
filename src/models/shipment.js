const mongoose = require("mongoose");

/**
 * Shipment represents a shipment process: exporter, importer,
 * modal, the derived processType, status (0-7), and incoterm.
 * See README > Shipment Lifecycle for the business rules behind
 * each field.
 *
 * exportStage/importStage: optional, populated for processes
 * with two operational fronts (typically INTERCOMPANY). Each
 * carries its own carrierCompany/warehouseCompany, status, and
 * dates. carrierCompany/warehouseCompany are what an
 * ASSIGNED_SHIPMENT AccessRole resolves against, per stage.
 */
const shipmentStageSchema = new mongoose.Schema(
  {
    carrierCompany: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    warehouseCompany: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    status: { type: Number, enum: [0, 1, 2, 3, 4, 5, 6, 7] },
    plannedDate: { type: Date },
    actualDate: { type: Date },
  },
  { _id: false }
);

const shipmentSchema = new mongoose.Schema(
  {
    reference: { type: String, trim: true, unique: true, sparse: true },
    exporterCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    importerCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    modal: {
      type: String,
      enum: ["MARITIME", "AIR", "ROAD", "OTHER"],
      required: true,
    },
    processType: {
      type: String,
      enum: ["EXPORT", "IMPORT", "INTERCOMPANY"],
      required: true,
    },
    status: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6, 7],
      default: 0,
      required: true,
    },
    incoterm: {
      type: String,
      enum: ["EXW", "FCA", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DDP"],
    },
    exportStage: { type: shipmentStageSchema },
    importStage: { type: shipmentStageSchema },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);