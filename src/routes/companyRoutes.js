const express = require("express");
const companyController = require("../controllers/companyController");
 
const router = express.Router();
 
router.post("/", companyController.create);
router.get("/", companyController.list);
router.get("/:id", companyController.getById);
router.put("/:id", companyController.update);
router.delete("/:id", companyController.remove);
 
module.exports = router;