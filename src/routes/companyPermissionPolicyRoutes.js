const express = require("express");
const controller = require("../controllers/companyPermissionPolicyController");

const router = express.Router();

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:companyId", controller.getByCompany);
router.put("/:companyId", controller.updateByCompany);
router.delete("/:companyId", controller.removeByCompany);

module.exports = router;