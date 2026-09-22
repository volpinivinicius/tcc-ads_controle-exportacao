const express = require("express");
const companyService = require("../services/companyService");
const systemPermissionService = require("../services/systemPermissionService");
const companyPermissionPolicyService = require("../services/companyPermissionPolicyService");
const accessRoleService = require("../services/accessRoleService");
const userService = require("../services/userService");
const shipmentService = require("../services/shipmentService");
const bookingService = require("../services/bookingService");
const containerService = require("../services/containerService");
const allocationService = require("../services/shipmentContainerAllocationService");

const router = express.Router();
const LINK_SLOTS = 3; // fixed number of company/accessRole rows on the User form (no client-side JS yet)
const CONTAINER_SLOTS = 3; // fixed number of requestedContainers rows on the Booking form (no client-side JS yet)

const SHIPMENT_STATUS_LABELS = {
  0: "Novo embarque",
  1: "Aguardando liberação para faturamento",
  2: "Parcialmente faturado",
  3: "Aguardando coleta/embarque",
  4: "Embarcado",
  5: "Aguardando emissão de documentação",
  6: "Aguardando transferência de posse",
  7: "Encerrado",
};

/** Normalizes a checkbox field into an array (single checked value posts as a string, not an array). */
function toArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** qs (express.urlencoded extended:true) already parses links[0][company] into an array of objects. */
function parseLinks(rawLinks) {
  if (!rawLinks) return [];
  const list = Array.isArray(rawLinks) ? rawLinks : Object.values(rawLinks);
  return list
    .filter((l) => l && l.company && l.accessRole)
    .map((l) => ({ company: l.company, accessRole: l.accessRole }));
}

/** Same bracket-array pattern as parseLinks, for the Booking form's fixed rows. */
function parseRequestedContainers(raw) {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : Object.values(raw);
  return list
    .filter((c) => c && c.size && c.quantity)
    .map((c) => ({ size: c.size, quantity: Number(c.quantity) }));
}

function groupByResource(permissions) {
  return permissions.reduce((acc, p) => {
    (acc[p.resource] = acc[p.resource] || []).push(p);
    return acc;
  }, {});
}

router.get("/", (req, res) => {
  res.render("dashboard", { title: "Dashboard" });
});

router.get("/profile", (req, res) => {
  res.render("profile", { title: "Meu Perfil" });
});

// ---------- Companies ----------

router.get("/companies", async (req, res, next) => {
  try {
    const filters = {
      businessRole: req.query.businessRole,
      isGroupCompany: req.query.isGroupCompany,
      isActive: req.query.isActive,
    };
    const companies = await companyService.listCompanies(req.user, filters);
    res.render("companies", { title: "Empresas", companies, filters });
  } catch (error) {
    next(error);
  }
});

router.get("/companies/new", (req, res) => {
  res.render("forms/companyForm", { title: "Nova Empresa", company: null, error: null });
});

router.post("/companies", async (req, res) => {
  try {
    await companyService.createCompany({
      name: req.body.name,
      taxId: req.body.taxId,
      country: req.body.country,
      businessRoles: toArray(req.body.businessRoles),
      isGroupCompany: req.body.isGroupCompany === "true",
    });
    res.redirect("/companies");
  } catch (error) {
    res.status(error.status || 500).render("forms/companyForm", {
      title: "Nova Empresa",
      company: req.body,
      error: error.message,
    });
  }
});

router.get("/companies/:id/edit", async (req, res, next) => {
  try {
    const company = await companyService.getCompanyById(req.params.id);
    res.render("forms/companyForm", { title: "Editar Empresa", company, error: null });
  } catch (error) {
    next(error);
  }
});

router.post("/companies/:id", async (req, res) => {
  try {
    await companyService.updateCompany(req.params.id, {
      name: req.body.name,
      taxId: req.body.taxId,
      country: req.body.country,
      businessRoles: toArray(req.body.businessRoles),
      isGroupCompany: req.body.isGroupCompany === "true",
    });
    res.redirect("/companies");
  } catch (error) {
    res.status(error.status || 500).render("forms/companyForm", {
      title: "Editar Empresa",
      company: { ...req.body, _id: req.params.id },
      error: error.message,
    });
  }
});

router.post("/companies/:id/delete", async (req, res, next) => {
  try {
    await companyService.deactivateCompany(req.params.id);
    res.redirect("/companies");
  } catch (error) {
    next(error);
  }
});

router.post("/companies/:id/reactivate", async (req, res, next) => {
  try {
    await companyService.reactivateCompany(req.params.id);
    res.redirect("/companies");
  } catch (error) {
    next(error);
  }
});

router.post("/companies/:id/hard-delete", async (req, res, next) => {
  try {
    await companyService.hardDeleteCompany(req.params.id, req.user);
    res.redirect("/companies");
  } catch (error) {
    next(error);
  }
});

// ---------- System Permissions (read-only) ----------

router.get("/system-permissions", async (req, res, next) => {
  try {
    const permissions = await systemPermissionService.listPermissions();
    res.render("systemPermissions", { title: "Permissões do Sistema", permissions });
  } catch (error) {
    next(error);
  }
});

// ---------- Company Permission Policies ----------

router.get("/company-permission-policies", async (req, res, next) => {
  try {
    const policies = await companyPermissionPolicyService.listPolicies(req.user);
    res.render("companyPermissionPolicies", { title: "Políticas de Permissão", policies });
  } catch (error) {
    next(error);
  }
});

router.get("/company-permission-policies/new", async (req, res, next) => {
  try {
    const companies = await companyService.listCompanies(req.user);
    const permissions = await systemPermissionService.listPermissions();
    res.render("forms/companyPermissionPolicyForm", {
      title: "Nova Política de Permissão",
      companies,
      permissionsByResource: groupByResource(permissions),
      policy: null,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/company-permission-policies", async (req, res) => {
  try {
    await companyPermissionPolicyService.createPolicy(
      { company: req.body.company, allowedPermissions: toArray(req.body.allowedPermissions) },
      req.user
    );
    res.redirect("/company-permission-policies");
  } catch (error) {
    const companies = await companyService.listCompanies(req.user);
    const permissions = await systemPermissionService.listPermissions();
    res.status(error.status || 500).render("forms/companyPermissionPolicyForm", {
      title: "Nova Política de Permissão",
      companies,
      permissionsByResource: groupByResource(permissions),
      policy: { company: req.body.company, allowedPermissions: toArray(req.body.allowedPermissions) },
      error: error.message,
    });
  }
});

router.get("/company-permission-policies/:companyId/edit", async (req, res, next) => {
  try {
    const existing = await companyPermissionPolicyService.getPolicyByCompanyId(
      req.params.companyId,
      req.user
    );
    const companies = await companyService.listCompanies(req.user);
    const permissions = await systemPermissionService.listPermissions();
    res.render("forms/companyPermissionPolicyForm", {
      title: "Editar Política de Permissão",
      companies,
      permissionsByResource: groupByResource(permissions),
      policy: {
        _isEdit: true,
        company: req.params.companyId,
        allowedPermissions: existing.allowedPermissions.map((p) => String(p._id || p)),
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/company-permission-policies/:companyId", async (req, res) => {
  try {
    await companyPermissionPolicyService.updatePolicyByCompanyId(
      req.params.companyId,
      { allowedPermissions: toArray(req.body.allowedPermissions) },
      req.user
    );
    res.redirect("/company-permission-policies");
  } catch (error) {
    const companies = await companyService.listCompanies(req.user);
    const permissions = await systemPermissionService.listPermissions();
    res.status(error.status || 500).render("forms/companyPermissionPolicyForm", {
      title: "Editar Política de Permissão",
      companies,
      permissionsByResource: groupByResource(permissions),
      policy: {
        _isEdit: true,
        company: req.params.companyId,
        allowedPermissions: toArray(req.body.allowedPermissions),
      },
      error: error.message,
    });
  }
});

router.post("/company-permission-policies/:companyId/delete", async (req, res, next) => {
  try {
    await companyPermissionPolicyService.deletePolicyByCompanyId(req.params.companyId, req.user);
    res.redirect("/company-permission-policies");
  } catch (error) {
    next(error);
  }
});

// ---------- Access Roles ----------

router.get("/access-roles", async (req, res, next) => {
  try {
    const filters = {
      scope: req.query.scope,
      company: req.query.company,
      isActive: req.query.isActive,
    };
    const roles = await accessRoleService.listAccessRoles(req.user, filters);
    const companies = await companyService.listCompanies(req.user);
    res.render("accessRoles", { title: "Perfis de Acesso", roles, companies, filters });
  } catch (error) {
    next(error);
  }
});

router.get("/access-roles/new", async (req, res, next) => {
  try {
    const companies = await companyService.listCompanies(req.user);
    const permissions = await systemPermissionService.listPermissions();
    res.render("forms/accessRoleForm", {
      title: "Novo Perfil de Acesso",
      companies,
      permissionsByResource: groupByResource(permissions),
      role: null,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/access-roles", async (req, res) => {
  try {
    await accessRoleService.createAccessRole(
      {
        name: req.body.name,
        scope: req.body.scope,
        company: req.body.scope === "SYSTEM" ? undefined : req.body.company,
        permissions: toArray(req.body.permissions),
      },
      req.user
    );
    res.redirect("/access-roles");
  } catch (error) {
    const companies = await companyService.listCompanies(req.user);
    const permissions = await systemPermissionService.listPermissions();
    res.status(error.status || 500).render("forms/accessRoleForm", {
      title: "Novo Perfil de Acesso",
      companies,
      permissionsByResource: groupByResource(permissions),
      role: {
        name: req.body.name,
        scope: req.body.scope,
        company: req.body.company,
        permissions: toArray(req.body.permissions),
      },
      error: error.message,
    });
  }
});

router.get("/access-roles/:id/edit", async (req, res, next) => {
  try {
    const role = await accessRoleService.getAccessRoleById(req.params.id, req.user);
    const companies = await companyService.listCompanies(req.user);
    const permissions = await systemPermissionService.listPermissions();
    res.render("forms/accessRoleForm", {
      title: "Editar Perfil de Acesso",
      companies,
      permissionsByResource: groupByResource(permissions),
      role: {
        _id: role._id,
        name: role.name,
        scope: role.scope,
        company: role.company ? String(role.company._id || role.company) : "",
        permissions: role.permissions.map((p) => String(p._id || p)),
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/access-roles/:id", async (req, res) => {
  try {
    await accessRoleService.updateAccessRole(
      req.params.id,
      {
        name: req.body.name,
        scope: req.body.scope,
        company: req.body.scope === "SYSTEM" ? undefined : req.body.company,
        permissions: toArray(req.body.permissions),
      },
      req.user
    );
    res.redirect("/access-roles");
  } catch (error) {
    const companies = await companyService.listCompanies(req.user);
    const permissions = await systemPermissionService.listPermissions();
    res.status(error.status || 500).render("forms/accessRoleForm", {
      title: "Editar Perfil de Acesso",
      companies,
      permissionsByResource: groupByResource(permissions),
      role: {
        _id: req.params.id,
        name: req.body.name,
        scope: req.body.scope,
        company: req.body.company,
        permissions: toArray(req.body.permissions),
      },
      error: error.message,
    });
  }
});

router.post("/access-roles/:id/delete", async (req, res, next) => {
  try {
    await accessRoleService.deactivateAccessRole(req.params.id, req.user);
    res.redirect("/access-roles");
  } catch (error) {
    next(error);
  }
});

router.post("/access-roles/:id/reactivate", async (req, res, next) => {
  try {
    await accessRoleService.reactivateAccessRole(req.params.id, req.user);
    res.redirect("/access-roles");
  } catch (error) {
    next(error);
  }
});

router.post("/access-roles/:id/hard-delete", async (req, res, next) => {
  try {
    await accessRoleService.hardDeleteAccessRole(req.params.id, req.user);
    res.redirect("/access-roles");
  } catch (error) {
    next(error);
  }
});

// ---------- Users ----------

router.get("/users", async (req, res, next) => {
  try {
    const filters = {
      company: req.query.company,
      isActive: req.query.isActive,
    };
    const users = await userService.listUsers(req.user, filters);
    const companies = await companyService.listCompanies(req.user);
    res.render("users", { title: "Usuários", users, companies, filters });
  } catch (error) {
    next(error);
  }
});

router.get("/users/new", async (req, res, next) => {
  try {
    const companies = await companyService.listCompanies(req.user);
    const roles = await accessRoleService.listAccessRoles(req.user);
    res.render("forms/userForm", {
      title: "Novo Usuário",
      companies,
      roles,
      targetUser: null,
      linkSlots: LINK_SLOTS,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/users", async (req, res) => {
  try {
    await userService.createUser(
      {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        links: parseLinks(req.body.links),
      },
      req.user
    );
    res.redirect("/users");
  } catch (error) {
    const companies = await companyService.listCompanies(req.user);
    const roles = await accessRoleService.listAccessRoles(req.user);
    res.status(error.status || 500).render("forms/userForm", {
      title: "Novo Usuário",
      companies,
      roles,
      targetUser: { name: req.body.name, email: req.body.email, links: parseLinks(req.body.links) },
      linkSlots: LINK_SLOTS,
      error: error.message,
    });
  }
});

router.get("/users/:id/edit", async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user);
    const companies = await companyService.listCompanies(req.user);
    const roles = await accessRoleService.listAccessRoles(req.user);
    res.render("forms/userForm", {
      title: "Editar Usuário",
      companies,
      roles,
      targetUser: {
        _id: user._id,
        name: user.name,
        email: user.email,
        links: user.links.map((l) => ({
          company: String(l.company?._id || l.company),
          accessRole: String(l.accessRole?._id || l.accessRole),
        })),
      },
      linkSlots: LINK_SLOTS,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/users/:id", async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      email: req.body.email,
      links: parseLinks(req.body.links),
    };
    if (req.body.password) payload.password = req.body.password; // blank = keep current password
    await userService.updateUser(req.params.id, payload, req.user);
    res.redirect("/users");
  } catch (error) {
    const companies = await companyService.listCompanies(req.user);
    const roles = await accessRoleService.listAccessRoles(req.user);
    res.status(error.status || 500).render("forms/userForm", {
      title: "Editar Usuário",
      companies,
      roles,
      targetUser: {
        _id: req.params.id,
        name: req.body.name,
        email: req.body.email,
        links: parseLinks(req.body.links),
      },
      linkSlots: LINK_SLOTS,
      error: error.message,
    });
  }
});

router.post("/users/:id/delete", async (req, res, next) => {
  try {
    await userService.deactivateUser(req.params.id, req.user);
    res.redirect("/users");
  } catch (error) {
    next(error);
  }
});

router.post("/users/:id/reactivate", async (req, res, next) => {
  try {
    await userService.reactivateUser(req.params.id, req.user);
    res.redirect("/users");
  } catch (error) {
    next(error);
  }
});

router.post("/users/:id/hard-delete", async (req, res, next) => {
  try {
    await userService.hardDeleteUser(req.params.id, req.user);
    res.redirect("/users");
  } catch (error) {
    next(error);
  }
});

// ---------- Placeholders ----------

router.get("/shipments", async (req, res, next) => {
  try {
    const filters = {
      modal: req.query.modal,
      processType: req.query.processType,
      status: req.query.status,
      isActive: req.query.isActive,
    };
    const shipments = await shipmentService.listShipments(req.user, filters);
    res.render("shipments", {
      title: "Embarques",
      shipments,
      filters,
      statusLabels: SHIPMENT_STATUS_LABELS,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/shipments/new", async (req, res, next) => {
  try {
    const companies = await companyService.listCompanies(req.user);
    res.render("forms/shipmentForm", {
      title: "Novo Embarque",
      companies,
      statusLabels: SHIPMENT_STATUS_LABELS,
      shipment: null,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/shipments", async (req, res) => {
  try {
    await shipmentService.createShipment(
      {
        reference: req.body.reference || undefined,
        exporterCompany: req.body.exporterCompany,
        importerCompany: req.body.importerCompany,
        modal: req.body.modal,
        incoterm: req.body.incoterm || undefined,
      },
      req.user
    );
    res.redirect("/shipments");
  } catch (error) {
    const companies = await companyService.listCompanies(req.user);
    res.status(error.status || 500).render("forms/shipmentForm", {
      title: "Novo Embarque",
      companies,
      statusLabels: SHIPMENT_STATUS_LABELS,
      shipment: req.body,
      error: error.message,
    });
  }
});

router.get("/shipments/:id", async (req, res, next) => {
  try {
    const shipment = await shipmentService.getShipmentById(req.params.id, req.user);
    const allocations = await allocationService.listAllocations(req.user, { shipment: req.params.id });
    const allContainers = await containerService.listContainers(req.user, { isActive: "true" });
    const allocatedContainerIds = new Set(
      allocations.map((a) => String(a.container?._id || a.container))
    );
    const availableContainers = allContainers.filter(
      (c) => !allocatedContainerIds.has(String(c._id))
    );
    res.render("shipmentDetail", {
      title: "Embarque " + (shipment.reference || shipment._id),
      shipment,
      allocations,
      availableContainers,
      statusLabels: SHIPMENT_STATUS_LABELS,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/shipments/:id/allocate-container", async (req, res, next) => {
  try {
    await allocationService.createAllocation(
      {
        shipment: req.params.id,
        container: req.body.container,
        weightKg: req.body.weightKg || undefined,
        volumeM3: req.body.volumeM3 || undefined,
      },
      req.user
    );
    res.redirect("/shipments/" + req.params.id);
  } catch (error) {
    try {
      const shipment = await shipmentService.getShipmentById(req.params.id, req.user);
      const allocations = await allocationService.listAllocations(req.user, { shipment: req.params.id });
      const allContainers = await containerService.listContainers(req.user, { isActive: "true" });
      const allocatedContainerIds = new Set(
        allocations.map((a) => String(a.container?._id || a.container))
      );
      const availableContainers = allContainers.filter(
        (c) => !allocatedContainerIds.has(String(c._id))
      );
      res.status(error.status || 500).render("shipmentDetail", {
        title: "Embarque " + (shipment.reference || shipment._id),
        shipment,
        allocations,
        availableContainers,
        statusLabels: SHIPMENT_STATUS_LABELS,
        error: error.message,
      });
    } catch (innerError) {
      next(innerError);
    }
  }
});

router.get("/shipments/:id/edit", async (req, res, next) => {
  try {
    const shipment = await shipmentService.getShipmentById(req.params.id, req.user);
    const companies = await companyService.listCompanies(req.user);
    res.render("forms/shipmentForm", {
      title: "Editar Embarque",
      companies,
      statusLabels: SHIPMENT_STATUS_LABELS,
      shipment: {
        _id: shipment._id,
        reference: shipment.reference,
        exporterCompany: String(shipment.exporterCompany?._id || shipment.exporterCompany),
        importerCompany: String(shipment.importerCompany?._id || shipment.importerCompany),
        modal: shipment.modal,
        incoterm: shipment.incoterm,
        status: shipment.status,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/shipments/:id", async (req, res) => {
  try {
    await shipmentService.updateShipment(
      req.params.id,
      {
        reference: req.body.reference || undefined,
        exporterCompany: req.body.exporterCompany,
        importerCompany: req.body.importerCompany,
        modal: req.body.modal,
        incoterm: req.body.incoterm || undefined,
        status: req.body.status !== undefined ? Number(req.body.status) : undefined,
      },
      req.user
    );
    res.redirect("/shipments");
  } catch (error) {
    const companies = await companyService.listCompanies(req.user);
    res.status(error.status || 500).render("forms/shipmentForm", {
      title: "Editar Embarque",
      companies,
      statusLabels: SHIPMENT_STATUS_LABELS,
      shipment: { ...req.body, _id: req.params.id },
      error: error.message,
    });
  }
});

router.post("/shipments/:id/delete", async (req, res, next) => {
  try {
    await shipmentService.deactivateShipment(req.params.id, req.user);
    res.redirect("/shipments");
  } catch (error) {
    next(error);
  }
});

router.post("/shipments/:id/reactivate", async (req, res, next) => {
  try {
    await shipmentService.reactivateShipment(req.params.id, req.user);
    res.redirect("/shipments");
  } catch (error) {
    next(error);
  }
});

router.post("/shipments/:id/hard-delete", async (req, res, next) => {
  try {
    await shipmentService.hardDeleteShipment(req.params.id, req.user);
    res.redirect("/shipments");
  } catch (error) {
    next(error);
  }
});

router.get("/bookings", async (req, res, next) => {
  try {
    const filters = { carrier: req.query.carrier, isActive: req.query.isActive };
    const bookings = await bookingService.listBookings(req.user, filters);
    res.render("bookings", { title: "Bookings", bookings, filters });
  } catch (error) {
    next(error);
  }
});

router.get("/bookings/new", (req, res) => {
  res.render("forms/bookingForm", {
    title: "Novo Booking",
    containerSlots: CONTAINER_SLOTS,
    booking: null,
    error: null,
  });
});

router.post("/bookings", async (req, res) => {
  try {
    await bookingService.createBooking(
      {
        bookingNumber: req.body.bookingNumber,
        carrier: req.body.carrier,
        vessel: req.body.vessel || undefined,
        voyage: req.body.voyage || undefined,
        portOfLoading: req.body.portOfLoading,
        portOfDischarge: req.body.portOfDischarge,
        estimatedDeparture: req.body.estimatedDeparture || undefined,
        estimatedArrival: req.body.estimatedArrival || undefined,
        cargoCutoff: req.body.cargoCutoff || undefined,
        documentCutoff: req.body.documentCutoff || undefined,
        requestedContainers: parseRequestedContainers(req.body.requestedContainers),
      },
      req.user
    );
    res.redirect("/bookings");
  } catch (error) {
    res.status(error.status || 500).render("forms/bookingForm", {
      title: "Novo Booking",
      containerSlots: CONTAINER_SLOTS,
      booking: { ...req.body, requestedContainers: parseRequestedContainers(req.body.requestedContainers) },
      error: error.message,
    });
  }
});

router.get("/bookings/:id", async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    const containers = await containerService.listContainers(req.user, { booking: req.params.id });
    res.render("bookingDetail", { title: "Booking " + booking.bookingNumber, booking, containers });
  } catch (error) {
    next(error);
  }
});

router.get("/bookings/:id/edit", async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    res.render("forms/bookingForm", {
      title: "Editar Booking",
      containerSlots: CONTAINER_SLOTS,
      booking,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/bookings/:id", async (req, res) => {
  try {
    await bookingService.updateBooking(
      req.params.id,
      {
        bookingNumber: req.body.bookingNumber,
        carrier: req.body.carrier,
        vessel: req.body.vessel || undefined,
        voyage: req.body.voyage || undefined,
        portOfLoading: req.body.portOfLoading,
        portOfDischarge: req.body.portOfDischarge,
        estimatedDeparture: req.body.estimatedDeparture || undefined,
        estimatedArrival: req.body.estimatedArrival || undefined,
        cargoCutoff: req.body.cargoCutoff || undefined,
        documentCutoff: req.body.documentCutoff || undefined,
        requestedContainers: parseRequestedContainers(req.body.requestedContainers),
      },
      req.user
    );
    res.redirect("/bookings");
  } catch (error) {
    res.status(error.status || 500).render("forms/bookingForm", {
      title: "Editar Booking",
      containerSlots: CONTAINER_SLOTS,
      booking: { ...req.body, _id: req.params.id, requestedContainers: parseRequestedContainers(req.body.requestedContainers) },
      error: error.message,
    });
  }
});

router.post("/bookings/:id/delete", async (req, res, next) => {
  try {
    await bookingService.deactivateBooking(req.params.id, req.user);
    res.redirect("/bookings");
  } catch (error) {
    next(error);
  }
});

router.post("/bookings/:id/reactivate", async (req, res, next) => {
  try {
    await bookingService.reactivateBooking(req.params.id, req.user);
    res.redirect("/bookings");
  } catch (error) {
    next(error);
  }
});

router.post("/bookings/:id/hard-delete", async (req, res, next) => {
  try {
    await bookingService.hardDeleteBooking(req.params.id, req.user);
    res.redirect("/bookings");
  } catch (error) {
    next(error);
  }
});

router.get("/containers", async (req, res, next) => {
  try {
    const filters = { booking: req.query.booking, isActive: req.query.isActive };
    const containers = await containerService.listContainers(req.user, filters);
    const bookings = await bookingService.listBookings(req.user);
    res.render("containers", { title: "Containers", containers, bookings, filters });
  } catch (error) {
    next(error);
  }
});

router.get("/containers/new", async (req, res, next) => {
  try {
    const bookings = await bookingService.listBookings(req.user);
    res.render("forms/containerForm", { title: "Novo Container", bookings, container: null, error: null });
  } catch (error) {
    next(error);
  }
});

router.post("/containers", async (req, res) => {
  try {
    await containerService.createContainer(
      {
        booking: req.body.booking,
        size: req.body.size,
        containerNumber: req.body.containerNumber || undefined,
        emptyPickupDate: req.body.emptyPickupDate || undefined,
        gateInDate: req.body.gateInDate || undefined,
        returnDate: req.body.returnDate || undefined,
      },
      req.user
    );
    res.redirect("/containers");
  } catch (error) {
    const bookings = await bookingService.listBookings(req.user);
    res.status(error.status || 500).render("forms/containerForm", {
      title: "Novo Container",
      bookings,
      container: req.body,
      error: error.message,
    });
  }
});

router.get("/containers/:id", async (req, res, next) => {
  try {
    const container = await containerService.getContainerById(req.params.id, req.user);
    const allocations = await allocationService.listAllocations(req.user, { container: req.params.id });
    const allShipments = await shipmentService.listShipments(req.user);
    const allocatedShipmentIds = new Set(
      allocations.map((a) => String(a.shipment?._id || a.shipment))
    );
    const availableShipments = allShipments.filter(
      (s) => !allocatedShipmentIds.has(String(s._id))
    );
    res.render("containerDetail", {
      title: "Container " + (container.containerNumber || container._id),
      container,
      allocations,
      availableShipments,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/containers/:id/allocate", async (req, res, next) => {
  try {
    await allocationService.createAllocation(
      {
        shipment: req.body.shipment,
        container: req.params.id,
        weightKg: req.body.weightKg || undefined,
        volumeM3: req.body.volumeM3 || undefined,
      },
      req.user
    );
    res.redirect("/containers/" + req.params.id);
  } catch (error) {
    try {
      const container = await containerService.getContainerById(req.params.id, req.user);
      const allocations = await allocationService.listAllocations(req.user, { container: req.params.id });
      const allShipments = await shipmentService.listShipments(req.user);
      const allocatedShipmentIds = new Set(
        allocations.map((a) => String(a.shipment?._id || a.shipment))
      );
      const availableShipments = allShipments.filter(
        (s) => !allocatedShipmentIds.has(String(s._id))
      );
      res.status(error.status || 500).render("containerDetail", {
        title: "Container " + (container.containerNumber || container._id),
        container,
        allocations,
        availableShipments,
        error: error.message,
      });
    } catch (innerError) {
      next(innerError);
    }
  }
});

router.get("/containers/:id/edit", async (req, res, next) => {
  try {
    const container = await containerService.getContainerById(req.params.id, req.user);
    const bookings = await bookingService.listBookings(req.user);
    res.render("forms/containerForm", {
      title: "Editar Container",
      bookings,
      container: {
        _id: container._id,
        booking: String(container.booking?._id || container.booking),
        size: container.size,
        containerNumber: container.containerNumber,
        emptyPickupDate: container.emptyPickupDate,
        gateInDate: container.gateInDate,
        returnDate: container.returnDate,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/containers/:id", async (req, res) => {
  try {
    await containerService.updateContainer(
      req.params.id,
      {
        booking: req.body.booking,
        size: req.body.size,
        containerNumber: req.body.containerNumber || undefined,
        emptyPickupDate: req.body.emptyPickupDate || undefined,
        gateInDate: req.body.gateInDate || undefined,
        returnDate: req.body.returnDate || undefined,
      },
      req.user
    );
    res.redirect("/containers");
  } catch (error) {
    const bookings = await bookingService.listBookings(req.user);
    res.status(error.status || 500).render("forms/containerForm", {
      title: "Editar Container",
      bookings,
      container: { ...req.body, _id: req.params.id },
      error: error.message,
    });
  }
});

router.post("/containers/:id/delete", async (req, res, next) => {
  try {
    await containerService.deactivateContainer(req.params.id, req.user);
    res.redirect("/containers");
  } catch (error) {
    next(error);
  }
});

router.post("/containers/:id/reactivate", async (req, res, next) => {
  try {
    await containerService.reactivateContainer(req.params.id, req.user);
    res.redirect("/containers");
  } catch (error) {
    next(error);
  }
});

router.post("/containers/:id/hard-delete", async (req, res, next) => {
  try {
    await containerService.hardDeleteContainer(req.params.id, req.user);
    res.redirect("/containers");
  } catch (error) {
    next(error);
  }
});

router.get("/allocations", async (req, res, next) => {
  try {
    const filters = {
      shipment: req.query.shipment,
      container: req.query.container,
      isActive: req.query.isActive,
    };
    const allocations = await allocationService.listAllocations(req.user, filters);
    res.render("allocations", { title: "Alocações", allocations, filters });
  } catch (error) {
    next(error);
  }
});

router.get("/allocations/new", async (req, res, next) => {
  try {
    const shipments = await shipmentService.listShipments(req.user);
    const containers = await containerService.listContainers(req.user);
    res.render("forms/allocationForm", {
      title: "Nova Alocação",
      shipments,
      containers,
      allocation: null,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/allocations", async (req, res) => {
  try {
    await allocationService.createAllocation(
      {
        shipment: req.body.shipment,
        container: req.body.container,
        weightKg: req.body.weightKg || undefined,
        volumeM3: req.body.volumeM3 || undefined,
      },
      req.user
    );
    res.redirect("/allocations");
  } catch (error) {
    const shipments = await shipmentService.listShipments(req.user);
    const containers = await containerService.listContainers(req.user);
    res.status(error.status || 500).render("forms/allocationForm", {
      title: "Nova Alocação",
      shipments,
      containers,
      allocation: req.body,
      error: error.message,
    });
  }
});

router.get("/allocations/:id/edit", async (req, res, next) => {
  try {
    const allocation = await allocationService.getAllocationById(req.params.id, req.user);
    const shipments = await shipmentService.listShipments(req.user);
    const containers = await containerService.listContainers(req.user);
    res.render("forms/allocationForm", {
      title: "Editar Alocação",
      shipments,
      containers,
      allocation: {
        _id: allocation._id,
        shipment: String(allocation.shipment?._id || allocation.shipment),
        container: String(allocation.container?._id || allocation.container),
        weightKg: allocation.weightKg,
        volumeM3: allocation.volumeM3,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/allocations/:id", async (req, res) => {
  try {
    await allocationService.updateAllocation(
      req.params.id,
      {
        shipment: req.body.shipment,
        container: req.body.container,
        weightKg: req.body.weightKg || undefined,
        volumeM3: req.body.volumeM3 || undefined,
      },
      req.user
    );
    res.redirect("/allocations");
  } catch (error) {
    const shipments = await shipmentService.listShipments(req.user);
    const containers = await containerService.listContainers(req.user);
    res.status(error.status || 500).render("forms/allocationForm", {
      title: "Editar Alocação",
      shipments,
      containers,
      allocation: { ...req.body, _id: req.params.id },
      error: error.message,
    });
  }
});

router.post("/allocations/:id/delete", async (req, res, next) => {
  try {
    await allocationService.deactivateAllocation(req.params.id, req.user);
    res.redirect("/allocations");
  } catch (error) {
    next(error);
  }
});

router.post("/allocations/:id/reactivate", async (req, res, next) => {
  try {
    await allocationService.reactivateAllocation(req.params.id, req.user);
    res.redirect("/allocations");
  } catch (error) {
    next(error);
  }
});

router.post("/allocations/:id/hard-delete", async (req, res, next) => {
  try {
    await allocationService.hardDeleteAllocation(req.params.id, req.user);
    res.redirect("/allocations");
  } catch (error) {
    next(error);
  }
});

module.exports = router;