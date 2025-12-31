const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { forgotPin, resetPin } = require("../controllers/pinController");

router.post("/forgot", auth, forgotPin);
router.post("/reset", resetPin);

module.exports = router;
