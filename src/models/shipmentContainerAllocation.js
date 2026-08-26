/**
 * Shipment Container Allocation Schema
 *
 * Represents the association between a Shipment and a Container,
 * resolving the many-to-many relationship between them: a single
 * Container can carry cargo from more than one Shipment (for
 * example, two Shipments each occupying part of the same
 * container), and a single Shipment's cargo can be split across
 * more than one Container.
 *
 * Since a Shipment is itself the commercial invoice for its
 * process, this allocation is what links a Container to the
 * invoice(s) it physically carries.
 *
 * May carry details specific to that allocation, such as the
 * volume, weight, or quantity of the Shipment's cargo occupying
 * that particular Container.
 */