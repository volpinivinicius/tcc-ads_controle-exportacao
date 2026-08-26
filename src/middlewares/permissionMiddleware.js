/**
 * Permission Middleware
 *
 * Checks whether the authenticated User is authorized to perform
 * the requested action, based on the SystemPermissions granted
 * by their AccessRole.
 *
 * The check has two parts: whether the AccessRole grants the
 * required permission, and whether the AccessRole's scope covers
 * the specific data being accessed. A SYSTEM-scoped AccessRole
 * covers any Company or Shipment; a COMPANY-scoped AccessRole
 * only covers data belonging to the User's own Company; an
 * ASSIGNED_SHIPMENT-scoped AccessRole only covers Shipments where
 * the User's Company has been assigned the relevant
 * responsibility (such as carrier or warehouse). When a Shipment
 * has separate exportStage and importStage subdocuments, this
 * coverage is resolved per stage rather than for the Shipment as
 * a whole, so a Company assigned to only one stage does not gain
 * visibility into the other.
 *
 * For COMPANY and ASSIGNED_SHIPMENT AccessRoles, the check also
 * respects the Company's Permission Policy, ensuring these
 * AccessRoles never exceed the permissions delegated by the
 * System Administrator.
 *
 * Requests made by users without the required permission, or
 * whose AccessRole scope does not cover the requested data, are
 * blocked before reaching the corresponding controller.
 */