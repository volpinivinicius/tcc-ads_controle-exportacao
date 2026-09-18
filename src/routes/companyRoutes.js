const express = require("express");
const companyController = require("../controllers/companyController");
const { authenticate } = require("../middlewares/authMiddleware");
const { requirePermission } = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.use(authenticate);

// No companyId resolver: creating a Company has no existing "owner" yet, so only a SYSTEM link with COMPANY_CREATE qualifies.
router.post("/", requirePermission("COMPANY_CREATE"), companyController.create);

// List filtering (SYSTEM vs. own companies) happens inside companyService.listCompanies.
router.get("/", companyController.list);

router.get("/:id", requirePermission("COMPANY_VIEW", (req) => req.params.id), companyController.getById);
router.put("/:id", requirePermission("COMPANY_UPDATE", (req) => req.params.id), companyController.update);
router.delete("/:id", requirePermission("COMPANY_DELETE", (req) => req.params.id), companyController.remove);

module.exports = router;