const express = require("express");
const controller = require("../controllers/shipmentNoteController");

// mergeParams: true so req.params.id (the parent Shipment's :id) is visible here.
const router = express.Router({ mergeParams: true });

router.get("/", controller.list);
router.post("/", (req, res, next) => {
  req.body.shipment = req.params.id;
  controller.create(req, res, next);
});

module.exports = router;