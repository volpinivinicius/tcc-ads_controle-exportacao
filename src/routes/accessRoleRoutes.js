const express = require("express");
const controller = require("../controllers/accessRoleController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);
// No route-level requirePermission here: the target company depends on the
// record (or the payload's scope), so authorization lives inside
// accessRoleService, which already has that data.

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);

// Soft delete (deactivate/reactivate): same rules as before (SYSTEM role -> SYSTEM only; COMPANY role -> SYSTEM or matching company).
router.delete("/:id", controller.deactivate);
router.post("/:id/reactivate", controller.reactivate);

// True removal: SYSTEM link required regardless of the role's own scope/company (asserted in the service).
router.delete("/:id/permanent", controller.hardDelete);

module.exports = router;