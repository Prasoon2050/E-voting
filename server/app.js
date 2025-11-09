const expressApp = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

dotenv.config();

const { connectDB } = require("./config/db");
const { seedInitialData } = require("./config/seed");

const voterRoutes = require("./routes/voterRoutes");
const voteRoutes = require("./routes/voteRoutes");
const resultRoutes = require("./routes/resultRoutes");
const adminRoutes = require("./routes/adminRoutes");

const appServer = expressApp();

appServer.use(cors());
appServer.use(bodyParser.json());
appServer.use(bodyParser.urlencoded({ extended: true }));

// Routes
appServer.use("/api/admin", adminRoutes);
appServer.use("/api/voters", voterRoutes);
appServer.use("/api/votes", voteRoutes);
appServer.use("/api/results", resultRoutes);

// health
appServer.get("/health", (req, res) => res.json({ ok: true }));

// Global error handler
appServer.use((err, req, res, next) => {
  console.error("Unhandled err", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB(process.env.MONGODB_URI);
    await seedInitialData();
    appServer.listen(PORT, () =>
      console.log(`Server listening on port ${PORT}`)
    );
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
