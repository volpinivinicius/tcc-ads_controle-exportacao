/**
 * See the model's comment (append-only feed, stage-aware
 * visibility). createSystemNote is called internally by other
 * services (e.g. bookingService, on a deadline change) — it
 * bypasses authorization, since the system itself is the author.
 */

const ShipmentNote = require("../models/shipmentNote");
const Shipment = require("../models/shipment");
const {
  hasSystemPermission,
  hasCompanyPermission,
  hasAssignedShipmentPermission,
  forbidden,
} = require("./authorizationService");

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function loadShipmentOrThrow(shipmentId) {
  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) throw badRequest("Shipment not found");
  return shipment;
}

function assignedStageFor(user, shipment, code) {
  const exportIds = [shipment.exportStage?.carrierCompany, shipment.exportStage?.warehouseCompany].filter(Boolean);
  const importIds = [shipment.importStage?.carrierCompany, shipment.importStage?.warehouseCompany].filter(Boolean);
  if (hasAssignedShipmentPermission(user, code, exportIds)) return "EXPORT";
  if (hasAssignedShipmentPermission(user, code, importIds)) return "IMPORT";
  return null;
}

/**
 * A manually-written USER note. SYSTEM/COMPANY authors can choose
 * visibility and an optional stage tag; an ASSIGNED_SHIPMENT
 * author is always forced to PUBLIC, auto-tagged with their own
 * assigned stage (they can't post to, or hide a note from, a
 * stage they aren't assigned to).
 */
async function createUserNote(data, actingUser) {
  const shipment = await loadShipmentOrThrow(data.shipment);

  const isSystemOrCompany =
    hasSystemPermission(actingUser, "SHIPMENT_NOTE_CREATE") ||
    hasCompanyPermission(actingUser, shipment.exporterCompany, "SHIPMENT_NOTE_CREATE") ||
    hasCompanyPermission(actingUser, shipment.importerCompany, "SHIPMENT_NOTE_CREATE");

  let stage = data.stage;
  let visibility = data.visibility || "PUBLIC";

  if (!isSystemOrCompany) {
    const assignedStage = assignedStageFor(actingUser, shipment, "SHIPMENT_NOTE_CREATE");
    if (!assignedStage) throw forbidden();
    stage = assignedStage;
    visibility = "PUBLIC";
  }

  return ShipmentNote.create({
    shipment: data.shipment,
    type: "USER",
    visibility,
    stage,
    author: actingUser._id,
    message: data.message,
    container: data.container || undefined,
    booking: data.booking || undefined,
  });
}

/** Called internally by other services — not exposed through a route, no authorization check. */
async function createSystemNote({ shipment, message, container, booking, stage }) {
  return ShipmentNote.create({
    shipment,
    type: "SYSTEM",
    visibility: "PUBLIC",
    stage,
    message,
    container,
    booking,
  });
}

async function listNotes(shipmentId, actingUser) {
  const shipment = await loadShipmentOrThrow(shipmentId);
  const notes = await ShipmentNote.find({ shipment: shipmentId })
    .sort({ createdAt: 1 })
    .populate("author")
    .populate("container")
    .populate("booking");

  if (
    hasSystemPermission(actingUser, "SHIPMENT_NOTE_VIEW") ||
    hasCompanyPermission(actingUser, shipment.exporterCompany, "SHIPMENT_NOTE_VIEW") ||
    hasCompanyPermission(actingUser, shipment.importerCompany, "SHIPMENT_NOTE_VIEW")
  ) {
    return notes;
  }

  const assignedStage = assignedStageFor(actingUser, shipment, "SHIPMENT_NOTE_VIEW");
  if (!assignedStage) throw forbidden();

  return notes.filter((note) => note.visibility === "PUBLIC" && note.stage === assignedStage);
}

module.exports = { createUserNote, createSystemNote, listNotes };