const express = require("express");
const controller = require("../controllers/shipmentContainerAllocationController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);

router.delete("/:id", controller.deactivate);
router.post("/:id/reactivate", controller.reactivate);
router.delete("/:id/permanent", controller.hardDelete);

module.exports = router;