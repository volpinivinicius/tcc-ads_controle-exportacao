/**
 * Shipment Schema
 *
 * Represents a shipment process managed by the system.
 * A shipment establishes the relationship between an exporter,
 * an importer, and the users responsible for managing the process.
 *
 * The shipment status and related dates are used to track
 * the lifecycle of the shipment from opening to completion.
 *
 * Since a shipment's exporter and importer are not required to
 * belong to the same country, and both can be group Companies, 
 * the shipment also carries a process
 * classification derived from the isIntercompany flag of its
 * exporter and importer: an export (only the exporter is a group
 * Company), an import (only the importer is a group Company), or
 * an intercompany/global process (both exporter and importer are
 * group Companies, in different countries). This classification
 * avoids ambiguity in reports and dashboards.
 *
 * For processes that involve two distinct operational fronts,
 * such as an intercompany/global process handled by separate
 * teams in the origin and destination countries, the shipment
 * carries two optional subdocuments, exportStage and importStage.
 * Each stage holds the fields relevant to its side of the
 * process independently, including the responsible team/Company,
 * the assigned carrier, the assigned warehouse, status, and
 * dates. This allows, for instance, the export team in Brazil
 * and the import team in the United States to operate on the
 * same shipment record while each managing only their own stage,
 * including cases where the carrier used on the export leg
 * differs from the one used on the import leg.
 *
 * Shipments that are purely an export or an import, without a
 * separate operational front on the other side, are not required
 * to populate both stages; the fields can be kept at the
 * shipment's top level or within a single relevant stage. An
 * overall status, either stored or derived from the two stages,
 * provides a consolidated view of the shipment as a whole.
 */