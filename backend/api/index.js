app.get("/env", (req, res) => {
  res.json({
    MONGODB_URI: process.env.MONGODB_URI ? "OK" : "NOT SET",
    JWT_SECRET: process.env.JWT_SECRET ? "OK" : "NOT SET"
  });
});


const app = require("../server");
module.exports = app;
