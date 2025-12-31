const Transaction = require("../models/Transaction");
const Account = require("../models/Account");

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { accountId, from, to } = req.query;

    let accounts = await Account.find({ user: userId });
    const accountIds = accounts.map((acc) => acc._id.toString());

    let filterAccounts = accountIds;
    if (accountId) {
      if (!accountIds.includes(accountId))
        return res
          .status(403)
          .json({ message: "Access denied for this account" });
      filterAccounts = [accountId];
    }

    const query = {
      $or: [
        { fromAccount: { $in: filterAccounts } },
        { toAccount: { $in: filterAccounts } },
      ],
    };

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const transactions = await Transaction.find(query)
      .populate("fromAccount", "accountNumber accountType")
      .populate("toAccount", "accountNumber accountType")
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};
