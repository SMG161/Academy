const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { initUserModel } = require('./src/models/User.model');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in .env');
  process.exit(1);
}

async function startServer() {
  try {
    const { client, db } = await connectDB(MONGO_URI);

    // Make the client & db available on the app if you need it elsewhere
    app.locals.mongoClient = client;
    app.locals.db = db;

    // Initialise collections / indexes
    await initUserModel();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server', error);
    process.exit(1);
  }
}

startServer();
