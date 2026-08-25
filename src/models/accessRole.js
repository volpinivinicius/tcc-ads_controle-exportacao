/**
 * Access Role Schema
 *
 * Represents a group of system permissions assigned to users
 * to define their authorized actions within the application.
 *
 * Each Access Role has a scope, either system-level or
 * company-level, which determines how broadly it grants
 * visibility and control over the system's data:
 *
 * - A system-level Access Role grants visibility across the
 *   entire group, regardless of which Company a Shipment
 *   belongs to. This is the scope used by Service Center users,
 *   who are otherwise ordinary Users of one of the group's
 *   Companies (the one that legally hosts the Service Center
 *   team), but whose assigned Access Role happens to be
 *   system-level rather than company-level.
 * - A company-level Access Role restricts visibility and control
 *   to the Shipments and data of the User's own Company, such as
 *   the sales team handling that Company's exports or the
 *   purchasing team handling its imports.
 *
 * A company-level role can only contain permissions allowed by
 * the corresponding Company's Permission Policy.
 *
 * The scope is an explicit property of the Access Role itself,
 * not something inferred from who created it. The System
 * Administrator can create and assign both system-level and
 * company-level roles (for any Company, respecting that
 * Company's Permission Policy); a Company Administrator can only
 * create and assign company-level roles for their own Company.
 */