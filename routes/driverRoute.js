const router = require("express").Router();
const driverController = require("../controllers/driverController");

router.get("/", driverController.getDriverSalaries);

module.exports = router;
