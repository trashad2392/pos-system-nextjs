import { PrismaClient } from '@prisma/client';
const prismaClientSingleton = () => new PrismaClient();
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? prismaClientSingleton();
export default db;
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
