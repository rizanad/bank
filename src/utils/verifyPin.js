module.exports = async function verifyPin(user, pin) {
  const MAX_ATTEMPTS = 3;

  if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
    const remainingMs = user.pinLockedUntil - new Date();
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    throw new Error(`PIN locked. Try again in ${remainingMinutes} minute(s).`);
  }

  const isValid = await user.comparePin(pin);

  if (!isValid) {
    user.pinAttempts += 1;
    const attemptsLeft = MAX_ATTEMPTS - user.pinAttempts;

    if (user.pinAttempts >= MAX_ATTEMPTS) {
      user.pinLockedUntil = new Date(Date.now() + 1 * 60 * 1000);
      await user.save();
      throw new Error("Too many failed attempts. PIN locked for 15 minutes.");
    }

    await user.save();
    throw new Error(`Invalid PIN. You have ${attemptsLeft} attempt(s) left.`);
  }

  user.pinAttempts = 0;
  user.pinLockedUntil = null;
  await user.save();

  return true;
};
