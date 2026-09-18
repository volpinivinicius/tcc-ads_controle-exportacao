const express = require("express");
const controller = require("../controllers/userController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);
// No route-level requirePermission here: authorization depends on the User's
// links (an array of companies), so it lives inside userService.

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);

// Soft delete (deactivate/reactivate): a Company Administrator can do this for Users who share a link to their own company.
router.delete("/:id", controller.deactivate);
router.post("/:id/reactivate", controller.reactivate);

// True removal: System Administrator only, unconditionally (asserted in the service).
router.delete("/:id/permanent", controller.hardDelete);

module.exports = router;