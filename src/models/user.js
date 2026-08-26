/**
 * User Schema
 *
 * Represents a user who can access and interact with the system.
 * Each user is associated with a company and an access role,
 * which determines the permissions available to that user.
 *
 * The user's Company reflects their legal employment relationship
 * and does not by itself limit their visibility in the system: a
 * user's actual scope of access is determined by their assigned
 * AccessRole's scope — COMPANY (restricted to their own Company's
 * data), ASSIGNED_SHIPMENT (restricted to Shipments where their
 * Company has an assigned responsibility, such as carrier or
 * warehouse), or SYSTEM (spanning the entire group, as is the
 * case for Service Center users).
 *
 * User access is controlled through the assigned AccessRole
 * rather than through permissions defined directly on the user.
 */