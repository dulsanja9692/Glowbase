require("dotenv").config();
// Firebase initializes on first import of any model (via config/firebase.js)
require("./config/firebase");
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`GlowBase API running on http://localhost:${PORT}`));
