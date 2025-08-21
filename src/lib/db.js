// src/lib/db.js
const { PrismaClient } = require('@prisma/client');

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = global;
const db = globalForPrisma.prisma ?? prismaClientSingleton();

module.exports = db;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
