const express = require("express");
const controller = require("../controllers/accessRoleController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);
// No route-level requirePermission here: the target company depends on the
// record (or the payload's scope), so the authorization check lives inside
// accessRoleService, which already has that data.

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;