import {PrismaClient} from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient();
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientSingleton };

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
})
// vericar se o banco de dados está conectado
const connected = prisma.$connect();
if (!connected) {
    console.error("Database connection failed")
    const prisma = prismaClientSingleton();
    prisma.$disconnect();
}

globalForPrisma.prisma = prisma;

export default prisma;