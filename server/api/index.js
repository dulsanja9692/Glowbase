// Vercel serverless entry point — initializes Firebase and exports the Express app
require("dotenv").config();
require("../src/config/firebase");
const app = require("../src/app");

module.exports = (req, res) => {
  return app(req, res);
};
