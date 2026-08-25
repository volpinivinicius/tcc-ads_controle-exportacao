/**
 * Company Schema
 *
 * Represents an organization registered in the system.
 * A company can act as an exporter, an importer, both, or as
 * a service center, depending on its defined business roles and type.
 *
 * Business roles determine the company's role in shipments,
 * while the company type determines how the organization is
 * managed within the system.
 *
 * Exporter, Importer, and Service Center are the initial company
 * types supported by the project. The model is designed to be
 * extended in the future to other participants of the logistics
 * process, such as carriers and warehousing companies, as the
 * system evolves to cover the full shipment chain.
 *
 * An isIntercompany flag indicates whether the company belongs
 * to the corporate group served by the Service Center (e.g.
 * Randon Corp), as opposed to being an external company (such
 * as a foreign buyer, or a third-party carrier or warehouse).
 * This flag is independent from the company's type: type defines
 * the functional role the company plays, while isIntercompany
 * defines its organizational ownership, and together they let
 * the Service Center segment which companies it manages versus
 * which ones it only interacts with through shipments.
 */