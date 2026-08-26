/**
 * Access Role Schema
 *
 * Represents a group of system permissions assigned to users
 * to define their authorized actions within the application.
 *
 * Each Access Role has a scope, which determines how broadly it
 * grants visibility and control over the system's data. Three
 * scope levels are supported:
 *
 * - SYSTEM: grants visibility across the entire group, regardless
 *   of which Company a Shipment belongs to. This is the scope
 *   used by Service Center users, who are otherwise ordinary
 *   Users of one of the group's Companies (the one that legally
 *   hosts the Service Center team), but whose assigned Access
 *   Role happens to be SYSTEM rather than COMPANY.
 * - COMPANY: restricts visibility and control to the Shipments
 *   and data of the User's own Company, such as the sales team
 *   handling that Company's exports or the purchasing team
 *   handling its imports.
 * - ASSIGNED_SHIPMENT: restricts visibility further, to only the
 *   Shipments where the User's Company has been explicitly
 *   assigned a responsibility, such as carrier or warehouse. This
 *   is the scope intended for external logistics chain
 *   participants, who should not see a Company's full shipment
 *   history, only the specific Shipments they are involved in.
 *
 * COMPANY and ASSIGNED_SHIPMENT roles can only contain
 * permissions allowed by the corresponding Company's Permission
 * Policy; SYSTEM roles are not subject to any Company's policy.
 *
 * The scope is an explicit property of the Access Role itself,
 * not something inferred from who created it. The System
 * Administrator can create and assign roles of any scope (for
 * any Company, respecting that Company's Permission Policy when
 * applicable); a Company Administrator can only create and
 * assign COMPANY or ASSIGNED_SHIPMENT roles for their own
 * Company.
 */