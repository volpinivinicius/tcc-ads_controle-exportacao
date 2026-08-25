/**
 * Company Service
 *
 * Contains the business logic related to Companies, such as
 * validating their business roles and type before persisting
 * changes.
 *
 * Exporter, Importer, and Service Center are the initial types
 * supported by the project. This service is designed to
 * accommodate future participants of the logistics process,
 * such as carriers and warehousing companies, keeping this
 * logic isolated from the Company Controller.
 *
 * Also manages the isIntercompany flag, which identifies
 * Companies belonging to the corporate group served by the
 * Service Center (e.g. Randon Corp). This flag is used to
 * segment which Companies the Service Center manages directly,
 * and to validate that a Shipment's exporter or importer is
 * always a group Company, regardless of how many external
 * Companies (foreign buyers, carriers, warehouses) participate
 * in the same process.
 */