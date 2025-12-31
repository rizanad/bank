const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const pinRoutes = require("./routes/pinRoutes");
const transactionHistoryRoutes = require("./routes/transactionHistoryRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/pin", pinRoutes);
app.use("/api", transactionHistoryRoutes);

module.exports = app;
