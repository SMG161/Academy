const { getDb } = require('../config/db');

const COLLECTION_NAME = 'users';

async function getUserCollection() {
  const db = getDb();
  return db.collection(COLLECTION_NAME);
}

async function initUserModel() {
  const collection = await getUserCollection();

  // Ensure unique indexes for email and username (username optional)
  await collection.createIndex({ email: 1 }, { unique: true });
  await collection.createIndex({ username: 1 }, { unique: true, sparse: true });
}

async function createUser(userData) {
  const collection = await getUserCollection();

  const now = new Date();
  const user = {
    email: userData.email.toLowerCase(),
    username: userData.username || null,
    passwordHash: userData.passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(user);
  return { _id: result.insertedId, ...user };
}

async function findUserByEmailOrUsername(identifier) {
  const collection = await getUserCollection();
  const query = {
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier },
    ],
  };

  return collection.findOne(query);
}

async function findUserByEmail(email) {
  const collection = await getUserCollection();
  return collection.findOne({ email: email.toLowerCase() });
}

module.exports = {
  initUserModel,
  createUser,
  findUserByEmailOrUsername,
  findUserByEmail,
};


