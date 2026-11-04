/**
 * See the model's comment. CREATE/DELETE (defining/removing a
 * requirement) are SYSTEM-or-exporter/importer-company only — a
 * management decision. VIEW/UPDATE (marking complete) extend to
 * ASSIGNED_SHIPMENT: unlike Containers/Notes, checklist items
 * aren't tied to one stage specifically (most documents concern
 * the whole shipment), so any Company assigned to either stage
 * qualifies, not resolved per stage.
 *
 * Completing an item generates a SYSTEM ShipmentNote (no stage
 * tag — an internal/general note, visible to SYSTEM/COMPANY
 * viewers, consistent with ShipmentNote's default visibility
 * rule for untagged notes).
 */

const ShipmentChecklistItem = require("../models/shipmentChecklistItem");
const Shipment = require("../models/shipment");
const {
  hasSystemPermission,
  hasCompanyPermission,
  hasAssignedShipmentPermission,
  forbidden,
} = require("./authorizationService");
const shipmentNoteService = require("./shipmentNoteService");

function notFound() {
  const error = new Error("Shipment checklist item not found");
  error.status = 404;
  return error;
}

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

function allStageCompanyIds(shipment) {
  return [
    shipment.exportStage?.carrierCompany,
    shipment.exportStage?.warehouseCompany,
    shipment.importStage?.carrierCompany,
    shipment.importStage?.warehouseCompany,
  ].filter(Boolean);
}

function assertCanManage(user, code, shipment) {
  if (
    hasSystemPermission(user, code) ||
    hasCompanyPermission(user, shipment.exporterCompany, code) ||
    hasCompanyPermission(user, shipment.importerCompany, code)
  ) {
    return;
  }
  throw forbidden();
}

function assertCanViewOrComplete(user, code, shipment) {
  if (
    hasSystemPermission(user, code) ||
    hasCompanyPermission(user, shipment.exporterCompany, code) ||
    hasCompanyPermission(user, shipment.importerCompany, code) ||
    hasAssignedShipmentPermission(user, code, allStageCompanyIds(shipment))
  ) {
    return;
  }
  throw forbidden();
}

async function createChecklistItem(data, actingUser) {
  const shipment = await loadShipmentOrThrow(data.shipment);
  assertCanManage(actingUser, "SHIPMENT_CHECKLIST_CREATE", shipment);
  return ShipmentChecklistItem.create({
    shipment: data.shipment,
    documentName: data.documentName,
  });
}

async function listChecklistItems(shipmentId, actingUser) {
  const shipment = await loadShipmentOrThrow(shipmentId);
  assertCanViewOrComplete(actingUser, "SHIPMENT_CHECKLIST_VIEW", shipment);
  return ShipmentChecklistItem.find({ shipment: shipmentId })
    .sort({ createdAt: 1 })
    .populate("completedBy");
}

async function completeChecklistItem(id, actingUser) {
  const item = await ShipmentChecklistItem.findById(id);
  if (!item) throw notFound();

  const shipment = await loadShipmentOrThrow(item.shipment);
  assertCanViewOrComplete(actingUser, "SHIPMENT_CHECKLIST_UPDATE", shipment);

  const updated = await ShipmentChecklistItem.findByIdAndUpdate(
    id,
    { status: "COMPLETED", completedBy: actingUser._id, completedAt: new Date() },
    { returnDocument: "after" }
  );

  await shipmentNoteService.createSystemNote({
    shipment: item.shipment,
    message: `Documento "${item.documentName}" marcado como concluído.`,
  });

  return updated;
}

async function deleteChecklistItem(id, actingUser) {
  const item = await ShipmentChecklistItem.findById(id);
  if (!item) throw notFound();

  const shipment = await loadShipmentOrThrow(item.shipment);
  assertCanManage(actingUser, "SHIPMENT_CHECKLIST_DELETE", shipment);

  await ShipmentChecklistItem.findByIdAndDelete(id);
  return item;
}

/** Whether the Shipment still has a pending document — exposed for the UI/future increments, does not itself change status. */
async function hasPendingItems(shipmentId) {
  const count = await ShipmentChecklistItem.countDocuments({
    shipment: shipmentId,
    status: "PENDING",
  });
  return count > 0;
}

module.exports = {
  createChecklistItem,
  listChecklistItems,
  completeChecklistItem,
  deleteChecklistItem,
  hasPendingItems,
};