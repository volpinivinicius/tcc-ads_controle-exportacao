/**
 * Shipment Service
 *
 * Contains the business logic related to Shipments, such as
 * validating the relationship between the exporting Company,
 * the importing Company, and the Users responsible for the
 * process.
 *
 * Manages the transitions of the Shipment's status and related
 * dates throughout its lifecycle, keeping this logic isolated
 * from the Shipment Controller.
 *
 * Validates that a Shipment's exporter and importer always
 * include at least one group Company (identified by the
 * isGroupCompany flag) — a Shipment where neither is a group
 * Company is invalid and must be rejected — and controls the
 * assignment of other logistics chain participants, such as
 * carrier and warehouse, ensuring each is restricted to viewing
 * only the Shipments where their Company has been assigned that
 * responsibility. When the Shipment has separate exportStage and
 * importStage subdocuments, this restriction is resolved per
 * stage: a Company assigned as carrier or warehouse on the
 * exportStage only grants visibility into that stage, not into
 * the importStage, even when both stages belong to the same
 * Shipment. Responses returned to these Users are limited to the
 * stage(s) their Company is assigned to.
 *
 * Derives the Shipment's processType classification from the
 * isGroupCompany flag of its exporter and importer: EXPORT when
 * only the exporter is a group Company, IMPORT when only the
 * importer is a group Company, or INTERCOMPANY when both
 * exporter and importer are group Companies (e.g. two entities
 * of the same group in different countries). This classification
 * is a summary label for reports and dashboards; the operational
 * distinction between the export and import sides of the process
 * is handled separately by the stages below.
 *
 * For processes with two operational fronts, manages the
 * exportStage and importStage independently, so that the
 * responsible team, carrier, warehouse, status, and dates on
 * each side of the process can be updated without affecting the
 * other, while still deriving a single overall status for the
 * Shipment as a whole. This is what allows, for example, an
 * export team in Brazil and an import team in the United States
 * to operate on the same INTERCOMPANY Shipment.
 *
 * Validates that a Booking is only linked to a Shipment whose
 * modal is MARITIME, rejecting the link otherwise, and derives
 * whether a MARITIME Shipment is still awaiting its Booking from
 * the presence of that link, rather than from a status value.
 *
 * Enforces the Shipment's status sequence, but does not trigger
 * any transition automatically: in this first version, every
 * status change, for every value in the sequence, is a manual
 * action performed by a user, even when other data would suggest
 * the shipment is ready to move on (such as a Booking being
 * linked, a checklist item being completed, or cargo being
 * recorded as collected elsewhere). This service validates that
 * a manually requested transition is coherent with the sequence
 * — for example, that status 1 (AWAITING_INVOICE_RELEASE) and 2
 * (PARTIALLY_INVOICED) can alternate back and forth while cargo
 * is invoiced in more than one batch, only advancing to status 3
 * once invoicing is complete; that status 3
 * (AWAITING_COLLECTION_OR_SHIPPING) carries a meaning that
 * depends on the Shipment's modal (collection for ROAD/AIR,
 * vessel loading for MARITIME) without needing a separate status
 * value; that status 5 (AWAITING_DOCUMENT_ISSUANCE) is only a
 * valid choice if the Shipment Checklist still has a pending
 * item after shipping, and can be skipped otherwise; and that
 * status 6 (AWAITING_OWNERSHIP_TRANSFER) precedes status 7
 * (CLOSED), with its expected duration depending on the
 * Shipment's Incoterm.
 */

/**
 * BASIC version — see the model's comment for what's deferred
 * (Booking, stages, checklist, notes, and detailed status
 * transition-sequence validation; any status value 0-7 is
 * currently accepted as a manual, deliberate user action).
 *
 * Business rules: derives processType from the isGroupCompany
 * flag of exporterCompany/importerCompany (EXPORT: only exporter
 * is group; IMPORT: only importer is group; INTERCOMPANY: both
 * are); rejects a shipment where neither is a group Company.
 *
 * Authorization: a Shipment has two potential "owning" companies
 * (exporter and importer), unlike single-company resources. SYSTEM
 * bypasses this; otherwise the acting user needs the relevant
 * permission on the exporter OR the importer (whichever is their
 * own company) — not necessarily both.
 */

const Shipment = require("../models/shipment");
const Company = require("../models/company");
const {
  hasSystemPermission,
  hasCompanyPermission,
  companyIdsWithPermission,
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
  query.$or = [
    { exporterCompany: { $in: allowedIds } },
    { importerCompany: { $in: allowedIds } },
  ];
  return Shipment.find(query).populate("exporterCompany").populate("importerCompany");
}

async function getShipmentById(id, user) {
  const shipment = await Shipment.findById(id)
    .populate("exporterCompany")
    .populate("importerCompany");
  if (!shipment) throw notFound();

  assertCanOnEitherCompany(
    user,
    "SHIPMENT_VIEW",
    shipment.exporterCompany?._id || shipment.exporterCompany,
    shipment.importerCompany?._id || shipment.importerCompany
  );
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