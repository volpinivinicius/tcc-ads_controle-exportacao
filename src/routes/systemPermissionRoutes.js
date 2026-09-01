const express = require("express");
const systemPermissionController = require("../controllers/systemPermissionController");
 
const router = express.Router();
 
router.get("/", systemPermissionController.list);
router.get("/:code", systemPermissionController.getByCode);
 
module.exports = router;