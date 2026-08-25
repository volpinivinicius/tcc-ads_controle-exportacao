/**
 * Access Role Service
 *
 * Contains the business logic related to Access Roles, such as
 * validating that a company-level AccessRole only contains
 * SystemPermissions allowed by the corresponding Company's
 * Permission Policy.
 *
 * Enforces that only the System Administrator can create or
 * assign system-level AccessRoles, while a Company Administrator
 * is limited to company-level AccessRoles of their own Company,
 * keeping this logic isolated from the Access Role Controller.
 *
 * Also protects Users who currently hold a system-level
 * AccessRole (such as Service Center users) from having their
 * AccessRole changed by a Company Administrator, even to a
 * company-level role of the same Company that legally hosts
 * them. Any change to a User's AccessRole while it is
 * system-level, whether an upgrade, a downgrade, or a removal,
 * requires the System Administrator.
 */