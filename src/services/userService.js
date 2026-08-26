/**
 * User Service
 *
 * Contains the business logic related to Users, such as
 * validating their association with a Company and an
 * AccessRole before persisting changes.
 *
 * Ensures that User management operations respect the
 * authorized scope of the requesting User, keeping this
 * logic isolated from the User Controller.
 *
 * Delegates to the Access Role Service the validation of
 * AccessRole assignment rules, including the restriction that a
 * User currently holding a SYSTEM-scoped AccessRole can only have
 * it changed, in either direction, by the System Administrator.
 */