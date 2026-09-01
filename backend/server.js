const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { runExpiryNotificationSweep } = require('./src/jobs/expiryNotifications');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const EXPIRY_SWEEP_INTERVAL_MS = 15 * 60 * 1000;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set');
  process.exit(1);
}

function scheduleExpiryNotificationSweep() {
  runExpiryNotificationSweep().catch((error) =>
    console.error('Expiry notification sweep failed:', error)
  );
  setInterval(() => {
    runExpiryNotificationSweep().catch((error) =>
      console.error('Expiry notification sweep failed:', error)
    );
  }, EXPIRY_SWEEP_INTERVAL_MS);
}

async function startServer() {
  await connectDB(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  scheduleExpiryNotificationSweep();
}

startServer();