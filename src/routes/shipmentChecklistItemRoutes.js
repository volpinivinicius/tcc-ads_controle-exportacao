const express = require("express");
const controller = require("../controllers/shipmentChecklistItemController");

// mergeParams: true so req.params.id (the parent Shipment's :id) is visible here.
const router = express.Router({ mergeParams: true });

router.get("/", controller.list);
router.post("/", controller.create);
router.post("/:itemId/complete", controller.complete);
router.delete("/:itemId", controller.remove);

module.exports = router;