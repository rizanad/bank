const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accountType: {
      type: String,
      enum: ["CHECKING", "SAVINGS"],
      default: "CHECKING",
    },
    accountNumber: { type: String, required: true, unique: true },
    accountHolderName: { type: String, required: true },
    balance: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["ACTIVE", "FROZEN", "CLOSED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

accountSchema.index({ user: 1, accountType: 1 }, { unique: true });

module.exports = mongoose.model("Account", accountSchema);
