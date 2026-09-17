const express = require("express");
const systemPermissionController = require("../controllers/systemPermissionController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

// Read-only reference catalog: any authenticated user may view it, no specific
// permission required beyond being logged in.
router.use(authenticate);

router.get("/", systemPermissionController.list);
router.get("/:code", systemPermissionController.getByCode);

module.exports = router;