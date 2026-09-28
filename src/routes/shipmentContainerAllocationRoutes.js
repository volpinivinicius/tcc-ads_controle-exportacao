const express = require("express");
const controller = require("../controllers/shipmentContainerAllocationController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);
// No route-level requirePermission: the target company comes from the
// referenced Shipment (exporter or importer), resolved inside the service.

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;