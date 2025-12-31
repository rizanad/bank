const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pin: { type: String, required: true },

    pinAttempts: { type: Number, default: 0 },
    pinLockedUntil: { type: Date, default: null },

    resetPinToken: { type: String },
    resetPinExpires: { type: Date },

    role: { type: String, enum: ["CUSTOMER", "ADMIN"], default: "CUSTOMER" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isModified("pin")) {
    this.pin = await bcrypt.hash(this.pin, 10);
    this.pinAttempts = 0;
    this.pinLockedUntil = null;
  }
});

userSchema.methods.comparePin = function (pin) {
  return bcrypt.compare(pin, this.pin);
};

module.exports = mongoose.model("User", userSchema);
