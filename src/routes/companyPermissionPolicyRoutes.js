const express = require("express");
const controller = require("../controllers/companyPermissionPolicyController");
const { authenticate } = require("../middlewares/authMiddleware");
const { requirePermission } = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authenticate);

// No companyId resolver on any of these: this entire resource is SYSTEM-only by
// design (only the System Administrator manages a Company's Permission Policy —
// see README > Permission Delegation).
router.post("/", requirePermission("PERMISSION_POLICY_MANAGE"), controller.create);
router.get("/", requirePermission("PERMISSION_POLICY_VIEW"), controller.list);
router.get("/:companyId", requirePermission("PERMISSION_POLICY_VIEW"), controller.getByCompany);
router.put("/:companyId", requirePermission("PERMISSION_POLICY_MANAGE"), controller.updateByCompany);
router.delete("/:companyId", requirePermission("PERMISSION_POLICY_MANAGE"), controller.removeByCompany);

module.exports = router;