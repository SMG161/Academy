const { MongoClient } = require('mongodb');

let client;
let db;

async function connectDB(uri) {
  if (db && client) {
    return { client, db };
  }

  client = new MongoClient(uri);
  await client.connect();

  const dbName = process.env.MONGO_DB_NAME || 'edubeacon';
  db = client.db(dbName);

  console.log(`✅ Connected to MongoDB (db: ${dbName})`);

  return { client, db };
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
}

module.exports = {
  connectDB,
  getDb,
};


