/**
 * Permission Middleware
 *
 * Checks whether the authenticated User is authorized to perform
 * the requested action, based on the SystemPermissions granted
 * by their AccessRole.
 *
 * The verification respects the Company's Permission Policy,
 * ensuring that company-level AccessRoles never exceed the
 * permissions delegated by the System Administrator.
 *
 * Requests made by users without the required permission are
 * blocked before reaching the corresponding controller.
 */