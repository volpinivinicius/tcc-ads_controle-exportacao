/**
 * User Controller
 *
 * Manages the creation, retrieval, update, and removal of Users
 * within the system.
 *
 * Each User is associated with a Company and an AccessRole, and
 * operations performed here must respect the permissions of the
 * requesting User, ensuring they only manage Users within their
 * authorized scope.
 *
 * When changing a User's AccessRole, defers to the restriction
 * enforced by the Access Role Service: a User currently holding
 * a system-level AccessRole (such as a Service Center user) can
 * only have that AccessRole changed by the System Administrator,
 * even by a Company Administrator of the Company that legally
 * hosts them.
 */