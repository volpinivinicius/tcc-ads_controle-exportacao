const express = require("express");
const controller = require("../controllers/bookingController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);
// No route-level requirePermission: authorization is entirely SYSTEM-only,
// asserted inside bookingService (a Booking has no owning company yet).

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);

router.delete("/:id", controller.deactivate);
router.post("/:id/reactivate", controller.reactivate);
router.delete("/:id/permanent", controller.hardDelete);

module.exports = router;