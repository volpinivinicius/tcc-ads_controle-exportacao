/**
 * Access Role Service
 *
 * Contains the business logic related to Access Roles, such as
 * validating that a COMPANY or ASSIGNED_SHIPMENT AccessRole only
 * contains SystemPermissions allowed by the corresponding
 * Company's Permission Policy.
 *
 * Enforces that only the System Administrator can create or
 * assign SYSTEM-scoped AccessRoles, while a Company Administrator
 * is limited to COMPANY or ASSIGNED_SHIPMENT AccessRoles of their
 * own Company, keeping this logic isolated from the Access Role
 * Controller.
 *
 * For ASSIGNED_SHIPMENT AccessRoles, also validates the link
 * between the User's Company and the specific Shipment
 * responsibility (such as carrier or warehouse) that determines
 * which Shipments the User is allowed to view. When a Shipment
 * has separate exportStage and importStage subdocuments, this
 * link is resolved per stage, not at the Shipment level: a
 * Company assigned as carrier or warehouse on only one stage
 * grants its Users visibility into that stage alone. This keeps
 * two unrelated external Companies, such as the carrier handling
 * the export leg and the carrier handling the import leg of the
 * same INTERCOMPANY Shipment, from seeing each other's side of
 * the process.
 *
 * Also protects Users who currently hold a SYSTEM-scoped
 * AccessRole (such as Service Center users) from having their
 * AccessRole changed by a Company Administrator, even to a
 * COMPANY-scoped role of the same Company that legally hosts
 * them. Any change to a User's AccessRole while it is
 * SYSTEM-scoped, whether an upgrade, a downgrade, or a removal,
 * requires the System Administrator.
 */