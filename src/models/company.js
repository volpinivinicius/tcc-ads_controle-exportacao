/**
 * Company Schema
 *
 * Represents an organization registered in the system.
 * A company can act as an exporter, an importer, or both,
 * depending on its defined business roles.
 *
 * Exporter and Importer are the initial company roles supported
 * by the project. The model is designed to be extended in the
 * future to other participants of the logistics process, such as
 * carriers and warehousing companies, as the system evolves to
 * cover the full shipment chain.
 *
 * An isGroupCompany flag indicates whether the company belongs
 * to the corporate group served by the system,
 * as opposed to being an external company (such as a foreign
 * buyer, or a third-party carrier or warehouse).
 *
 * The Service Center is not a company role or type. It is a team
 * legally hosted within one of the group's own companies (an
 * exporter and/or importer like any other), whose users are
 * distinguished not by the company they belong to, but by
 * holding a SYSTEM-scoped AccessRole that grants visibility over
 * shipments across the entire group, rather than only their own
 * company's shipments. See the AccessRole schema for details.
 */