const express = require("express");
const companyService = require("../services/companyService");
const systemPermissionService = require("../services/systemPermissionService");
const companyPermissionPolicyService = require("../services/companyPermissionPolicyService");
const accessRoleService = require("../services/accessRoleService");
const userService = require("../services/userService");
const shipmentService = require("../services/shipmentService");

const router = express.Router();
const LINK_SLOTS = 3; // fixed number of company/accessRole rows on the User form (no client-side JS yet)

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
    res.render("shipmentDetail", {
      title: "Embarque " + (shipment.reference || shipment._id),
      shipment,
      statusLabels: SHIPMENT_STATUS_LABELS,
    });
  } catch (error) {
    next(error);
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

router.get("/bookings", (req, res) => {
  res.render("placeholder", { title: "Bookings", activePage: "bookings" });
});

module.exports = router;