/**
 * Access Role Controller
 *
 * Manages the creation, retrieval, update, and removal of
 * Access Roles, which group the SystemPermissions assigned
 * to Users.
 *
 * Ensures that company-level AccessRoles only contain
 * permissions allowed by the corresponding Company's Permission
 * Policy.
 *
 * The System Administrator can create and assign both
 * system-level and company-level AccessRoles; a Company
 * Administrator can only create and assign company-level
 * AccessRoles for their own Company. Since the Service Center is
 * represented as a system-level AccessRole rather than as a
 * distinct Company type, this is also what prevents a Company
 * Administrator from granting Service Center-level access to
 * users of their own Company.
 */