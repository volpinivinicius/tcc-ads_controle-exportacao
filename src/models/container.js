/**
 * Container Schema
 *
 * Represents a physical container linked to a Booking. A Booking
 * can have several Containers, all sharing the Booking's
 * deadlines.
 *
 * The containerNumber is not required at creation: a Container
 * is initially registered with only its requested size/type,
 * reflecting that a Booking is made for a quantity of containers
 * before the physical units are picked up from the depot. The
 * containerNumber is filled in progressively as each container
 * is retrieved, often by the logistics operator or carrier
 * responsible for that pickup.
 *
 * Unlike deadlines, which live on the Booking, a Container
 * records its own realized operational dates (such as empty
 * pickup, gate-in at origin, and return at destination), since
 * containers under the same Booking are handled individually and
 * reach each milestone at different times.
 */