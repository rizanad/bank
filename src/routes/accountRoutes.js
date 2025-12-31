const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const {
  createAccount,
  getAccounts,
} = require("../controllers/accountController");

router.use(auth);
router.post("/", createAccount);
router.get("/", getAccounts);

module.exports = router;
