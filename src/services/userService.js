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
 */