/**
 * Access Role Controller
 *
 * Manages the creation, retrieval, update, and removal of
 * Access Roles, which group the SystemPermissions assigned
 * to Users.
 *
 * Ensures that company-level AccessRoles only contain
 * permissions allowed by the corresponding Company's Permission
 * Policy, while system-level AccessRoles are managed solely by
 * the System Administrator.
 */