/**
 * Access Role Service
 *
 * Contains the business logic related to Access Roles, such as
 * validating that a company-level AccessRole only contains
 * SystemPermissions allowed by the corresponding Company's
 * Permission Policy.
 *
 * Enforces the boundary between system-level and company-level
 * AccessRoles before persisting changes, keeping this logic
 * isolated from the Access Role Controller.
 */