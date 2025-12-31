const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    toAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    type: {
      type: String,
      enum: ["DEPOSIT", "WITHDRAW", "TRANSFER"],
      required: true,
    },
    amount: { type: Number, required: true },
    remarks: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
