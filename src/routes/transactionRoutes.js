const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const {
  deposit,
  withdraw,
  transfer,
} = require("../controllers/transactionController");

router.use(auth);
router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.post("/transfer", transfer);

module.exports = router;
