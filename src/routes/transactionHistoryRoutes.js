const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const {
  getTransactionHistory,
} = require("../controllers/transactionHistoryController");

router.get("/transaction-history", auth, getTransactionHistory);

module.exports = router;
