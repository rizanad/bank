const Transaction = require("../models/Transaction");

module.exports = async function checkDailyLimit(accountId, amount) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const result = await Transaction.aggregate([
    {
      $match: {
        fromAccount: accountId,
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const count = result[0]?.count || 0;
  const totalAmount = result[0]?.totalAmount || 0;

  if (count >= 10) {
    throw new Error("Daily transaction limit (10) exceeded");
  }

  if (totalAmount + amount > 200000) {
    throw new Error("Daily transaction amount limit (₹2,00,000) exceeded");
  }
};
