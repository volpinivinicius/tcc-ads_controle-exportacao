/**
 * See README > Shipment Lifecycle for the business rules
 * (processType derivation, status, modal/Booking rule, stages).
 *
 * Authorization: VIEW extends to ASSIGNED_SHIPMENT — a Company
 * assigned as carrier/warehouse on exportStage or importStage
 * can view the Shipment, resolved per stage (assigned on
 * exportStage only sees that assignment, not importStage's).
 * CREATE/UPDATE/DELETE remain SYSTEM-or-exporter/importer-company
 * only; ASSIGNED_SHIPMENT companies don't manage the Shipment
 * itself, only Container data (see containerService).
 */

const Shipment = require("../models/shipment");
const Company = require("../models/company");
const {
  hasSystemPermission,
  hasCompanyPermission,
  hasAssignedShipmentPermission,
  companyIdsWithPermission,
  assignedShipmentCompanyIds,
  forbidden,
} = require("./authorizationService");

function notFound() {
  const error = new Error("Shipment not found");
  error.status = 404;
  return error;
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function assertCanOnEitherCompany(user, code, companyIdA, companyIdB) {
  if (
    hasSystemPermission(user, code) ||
    hasCompanyPermission(user, companyIdA, code) ||
    hasCompanyPermission(user, companyIdB, code)
  ) {
    return;
  }
  throw forbidden();
}

/** Every carrier/warehouse Company assigned to either stage, regardless of which. */
function stageCompanyIds(shipment) {
  return [
    shipment.exportStage?.carrierCompany?._id || shipment.exportStage?.carrierCompany,
    shipment.exportStage?.warehouseCompany?._id || shipment.exportStage?.warehouseCompany,
    shipment.importStage?.carrierCompany?._id || shipment.importStage?.carrierCompany,
    shipment.importStage?.warehouseCompany?._id || shipment.importStage?.warehouseCompany,
  ].filter(Boolean);
}

function assertCanView(user, shipment) {
  if (
    hasSystemPermission(user, "SHIPMENT_VIEW") ||
    hasCompanyPermission(user, shipment.exporterCompany?._id || shipment.exporterCompany, "SHIPMENT_VIEW") ||
    hasCompanyPermission(user, shipment.importerCompany?._id || shipment.importerCompany, "SHIPMENT_VIEW") ||
    hasAssignedShipmentPermission(user, "SHIPMENT_VIEW", stageCompanyIds(shipment))
  ) {
    return;
  }
  throw forbidden();
}

async function deriveProcessType(exporterCompanyId, importerCompanyId) {
  const [exporter, importer] = await Promise.all([
    Company.findById(exporterCompanyId),
    Company.findById(importerCompanyId),
  ]);
  if (!exporter) throw badRequest("Exporter company not found");
  if (!importer) throw badRequest("Importer company not found");

  if (!exporter.isGroupCompany && !importer.isGroupCompany) {
    throw badRequest(
      "At least one of exporterCompany or importerCompany must be a group company"
    );
  }
  if (exporter.isGroupCompany && importer.isGroupCompany) return "INTERCOMPANY";
  if (exporter.isGroupCompany) return "EXPORT";
  return "IMPORT";
}

async function createShipment(data, actingUser) {
  assertCanOnEitherCompany(
    actingUser,
    "SHIPMENT_CREATE",
    data.exporterCompany,
    data.importerCompany
  );

  const processType = await deriveProcessType(data.exporterCompany, data.importerCompany);
  return Shipment.create({ ...data, processType });
}

/** filters (all optional): modal, processType, status (number), isActive ("true"/"false"). */
async function listShipments(user, filters = {}) {
  const query = {};
  if (filters.modal) query.modal = filters.modal;
  if (filters.processType) query.processType = filters.processType;
  if (filters.status !== undefined && filters.status !== "") query.status = Number(filters.status);
  if (filters.isActive !== undefined && filters.isActive !== "") {
    query.isActive = filters.isActive === true || filters.isActive === "true";
  }

  if (hasSystemPermission(user, "SHIPMENT_VIEW")) {
    return Shipment.find(query).populate("exporterCompany").populate("importerCompany");
  }

  const allowedIds = companyIdsWithPermission(user, "SHIPMENT_VIEW");
  const assignedIds = assignedShipmentCompanyIds(user, "SHIPMENT_VIEW");
  query.$or = [
    { exporterCompany: { $in: allowedIds } },
    { importerCompany: { $in: allowedIds } },
    { "exportStage.carrierCompany": { $in: assignedIds } },
    { "exportStage.warehouseCompany": { $in: assignedIds } },
    { "importStage.carrierCompany": { $in: assignedIds } },
    { "importStage.warehouseCompany": { $in: assignedIds } },
  ];
  return Shipment.find(query).populate("exporterCompany").populate("importerCompany");
}

async function getShipmentById(id, user) {
  const shipment = await Shipment.findById(id)
    .populate("exporterCompany")
    .populate("importerCompany")
    .populate("exportStage.carrierCompany")
    .populate("exportStage.warehouseCompany")
    .populate("importStage.carrierCompany")
    .populate("importStage.warehouseCompany");
  if (!shipment) throw notFound();

  assertCanView(user, shipment);
  return shipment;
}

async function updateShipment(id, data, actingUser) {
  const current = await Shipment.findById(id);
  if (!current) throw notFound();

  const permissionCode =
    data.status !== undefined && Object.keys(data).length === 1
      ? "SHIPMENT_STATUS_UPDATE"
      : "SHIPMENT_UPDATE";

  assertCanOnEitherCompany(
    actingUser,
    permissionCode,
    current.exporterCompany,
    current.importerCompany
  );

  if (data.exporterCompany || data.importerCompany) {
    data.processType = await deriveProcessType(
      data.exporterCompany || current.exporterCompany,
      data.importerCompany || current.importerCompany
    );
  }

  const shipment = await Shipment.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
  return shipment;
}

async function deactivateShipment(id, actingUser) {
  const current = await Shipment.findById(id);
  if (!current) throw notFound();

  assertCanOnEitherCompany(
    actingUser,
    "SHIPMENT_DELETE",
    current.exporterCompany,
    current.importerCompany
  );

  return Shipment.findByIdAndUpdate(id, { isActive: false }, { returnDocument: "after" });
}

async function reactivateShipment(id, actingUser) {
  const current = await Shipment.findById(id);
  if (!current) throw notFound();

  assertCanOnEitherCompany(
    actingUser,
    "SHIPMENT_DELETE",
    current.exporterCompany,
    current.importerCompany
  );

  return Shipment.findByIdAndUpdate(id, { isActive: true }, { returnDocument: "after" });
}

/** True, permanent removal — System Administrator only, unconditionally. */
async function hardDeleteShipment(id, actingUser) {
  if (!hasSystemPermission(actingUser, "SHIPMENT_DELETE")) throw forbidden();
  const shipment = await Shipment.findByIdAndDelete(id);
  if (!shipment) throw notFound();
  return shipment;
}

module.exports = {
  createShipment,
  listShipments,
  getShipmentById,
  updateShipment,
  deactivateShipment,
  reactivateShipment,
  hardDeleteShipment,
};