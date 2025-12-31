const crypto = require("crypto");
const User = require("../models/User");

exports.forgotPin = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ messsage: "No User Found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPinToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPinExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    res.json({
      message: "PIN reset token generated",
      resetToken,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate reset PIN" });
  }
};

exports.resetPin = async (req, res) => {
  try {
    const { token, newPin } = req.body;

    if (!token || !newPin) {
      return res.status(400).json({ message: "Token and new PIN required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPinToken: hashedToken,
      resetPinExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.pin = newPin;
    user.resetPinToken = undefined;
    user.resetPinExpires = undefined;

    await user.save();

    res.json({ message: "PIN reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset PIN" });
  }
};
