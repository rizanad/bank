const Account = require("../models/Account");

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { accountType } = req.body;
    const userId = req.user._id;

    const existing = await Account.findOne({ user: userId, accountType });
    if (existing) {
      return res
        .status(400)
        .json({ message: `You already have a ${accountType} account` });
    }

    const accountNumber = Math.floor(
      100000000 + Math.random() * 900000000
    ).toString();

    const accountHolderName = `${req.user.firstName} ${req.user.middleName} ${req.user.lastName}`;

    const account = await Account.create({
      user: userId,
      accountType,
      accountNumber,
      accountHolderName,
    });

    await account.populate("user", "firstName lastName");

    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
