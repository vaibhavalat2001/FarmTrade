// api/index.js
const app = require("../server"); // load Express app first

// Temporary route to test environment variables
app.get("/env", (req, res) => {
  res.json({
    MONGODB_URI: process.env.MONGODB_URI ? "OK" : "NOT SET",
    JWT_SECRET: process.env.JWT_SECRET ? "OK" : "NOT SET"
  });
});

module.exports = app;
