const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const checkDailyLimit = require("../utils/checkDailyLimit");
const verifyPin = require("../utils/verifyPin");

exports.deposit = async (req, res) => {
  try {
    const { accountId, amount, remarks } = req.body;

    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const account = await Account.findOneAndUpdate(
      { _id: accountId, user: req.user._id },
      { $inc: { balance: amountNumber } },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const transaction = await Transaction.create({
      toAccount: account._id,
      type: "DEPOSIT",
      amount: amountNumber,
      remarks,
    });

    res.json({
      message: "Deposit successful",
      transaction,
      account,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { accountId, amount, pin, remarks } = req.body;

    if (!pin) {
      return res.status(400).json({ message: "PIN is required" });
    }y

    await verifyPin(req.user, pin);

    const account = await Account.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (account.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    await checkDailyLimit(account._id, amount);
    account.balance -= amount;
    await account.save();

    const transaction = await Transaction.create({
      fromAccount: account._id,
      type: "WITHDRAW",
      amount,
      remarks,
    });

    res.json({ message: "Withdrawal successful", transaction });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.transfer = async (req, res) => {
  try {
    const { fromAccountNumber, toAccountNumber, amount, pin } = req.body;
    const user = req.user;

    if (!fromAccountNumber || !toAccountNumber || !amount) {
      return res.status(400).json({
        message:
          "Sender account number, receiver account number and amount is required ",
      });
    }

    if (!pin) return res.status(400).json({ message: "PIN is required" });
    if (!user.pin) return res.status(500).json({ message: "PIN not set" });

    const isPinValid = await user.comparePin(pin);
    if (!isPinValid) return res.status(401).json({ message: "Invalid PIN" });

    if (fromAccountNumber === toAccountNumber)
      return res
        .status(400)
        .json({ message: "Cannot transfer to same account" });

    if (amount <= 0)
      return res.status(400).json({ message: "Invalid transfer amount" });

    const fromAccount = await Account.findOne({
      accountNumber: fromAccountNumber,
      user: user._id,
      status: "ACTIVE",
    }).populate("user", "firstName lastName");

    if (!fromAccount)
      return res.status(404).json({ message: "Sender account not found" });

    const toAccount = await Account.findOne({
      accountNumber: toAccountNumber,
      status: "ACTIVE",
    }).populate("user", "firstName lastName");

    if (!toAccount)
      return res.status(404).json({ message: "Receiver account not found" });

    if (fromAccount.balance < amount)
      return res.status(400).json({ message: "Insufficient funds" });

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save();
    await toAccount.save();

    const transaction = await Transaction.create({
      fromAccount: fromAccount._id,
      toAccount: toAccount._id,
      type: "TRANSFER",
      amount,
    });

    res.status(200).json({
      message: "Transfer successful",
      transactionId: transaction._id,
      fromAccountNumber: fromAccount.accountNumber,
      fromAccountHolder: `${fromAccount.user.firstName} ${fromAccount.user.lastName}`,
      toAccountNumber: toAccount.accountNumber,
      toAccountHolder: `${toAccount.user.firstName} ${toAccount.user.lastName}`,
      newBalance: fromAccount.balance,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
