/**
 * Initial catalog, covering the resources implemented so far.
 * Extend this list as new resources are added; the seed script
 * is safe to re-run (upserts by code).
 */

const SystemPermission = require("../models/systemPermission");
 
const catalog = [
  { code: "COMPANY_VIEW", resource: "COMPANY", description: "View company records" },
  { code: "COMPANY_CREATE", resource: "COMPANY", description: "Create company records" },
  { code: "COMPANY_UPDATE", resource: "COMPANY", description: "Update company records" },
  { code: "COMPANY_DELETE", resource: "COMPANY", description: "Delete company records" },
 
  { code: "USER_VIEW", resource: "USER", description: "View user records" },
  { code: "USER_CREATE", resource: "USER", description: "Create user records" },
  { code: "USER_UPDATE", resource: "USER", description: "Update user records" },
  { code: "USER_DELETE", resource: "USER", description: "Delete user records" },
 
  { code: "ACCESS_ROLE_VIEW", resource: "ACCESS_ROLE", description: "View access roles" },
  { code: "ACCESS_ROLE_CREATE", resource: "ACCESS_ROLE", description: "Create access roles" },
  { code: "ACCESS_ROLE_UPDATE", resource: "ACCESS_ROLE", description: "Update access roles" },
  { code: "ACCESS_ROLE_ASSIGN", resource: "ACCESS_ROLE", description: "Assign an access role to a user" },
 
  { code: "SHIPMENT_VIEW", resource: "SHIPMENT", description: "View shipments" },
  { code: "SHIPMENT_CREATE", resource: "SHIPMENT", description: "Create shipments" },
  { code: "SHIPMENT_UPDATE", resource: "SHIPMENT", description: "Update shipment data" },
  { code: "SHIPMENT_STATUS_UPDATE", resource: "SHIPMENT", description: "Change a shipment's status" },
 
  { code: "SHIPMENT_NOTE_VIEW", resource: "SHIPMENT_NOTE", description: "View shipment notes" },
  { code: "SHIPMENT_NOTE_CREATE", resource: "SHIPMENT_NOTE", description: "Create shipment notes" },
 
  { code: "SHIPMENT_CHECKLIST_VIEW", resource: "SHIPMENT_CHECKLIST", description: "View shipment checklist items" },
  { code: "SHIPMENT_CHECKLIST_UPDATE", resource: "SHIPMENT_CHECKLIST", description: "Update shipment checklist items" },
 
  { code: "BOOKING_VIEW", resource: "BOOKING", description: "View bookings" },
  { code: "BOOKING_CREATE", resource: "BOOKING", description: "Create bookings" },
  { code: "BOOKING_UPDATE", resource: "BOOKING", description: "Update booking data, including deadlines" },
 
  { code: "CONTAINER_VIEW", resource: "CONTAINER", description: "View containers" },
  { code: "CONTAINER_UPDATE", resource: "CONTAINER", description: "Update container data, including container number" },
];
 
async function seedSystemPermissions() {
  for (const permission of catalog) {
    await SystemPermission.updateOne(
      { code: permission.code },
      { $set: permission },
      { upsert: true }
    );
  }
  console.log(`Seeded ${catalog.length} system permissions`);
}
 
module.exports = { catalog, seedSystemPermissions };