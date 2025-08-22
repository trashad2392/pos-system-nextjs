// src/lib/db.js
const { PrismaClient } = require('@prisma/client');
const { app } = require('electron');
const path = require('path');

let db;

// Export a function to initialize the client
// It will only be called after the Electron app is ready.
function initializeDb() {
  if (db) {
    return db;
  }

  // This is the correct, dynamic path to the user's database
  const dbPath = path.join(app.getPath('userData'), 'pos.db');

  db = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`,
      },
    },
  });
  
  return db;
}

module.exports = { initializeDb };