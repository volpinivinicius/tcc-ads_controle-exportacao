const express = require("express");
const controller = require("../controllers/shipmentController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);
// No route-level requirePermission here: a Shipment has two potential "owning"
// companies (exporter and importer), so authorization lives inside
// shipmentService, which checks both.

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);

router.delete("/:id", controller.deactivate);
router.post("/:id/reactivate", controller.reactivate);
router.delete("/:id/permanent", controller.hardDelete);

module.exports = router;