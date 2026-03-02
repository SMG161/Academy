const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set');
  process.exit(1);
}

async function startServer() {
  await connectDB(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();