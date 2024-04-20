import {PrismaClient} from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient();
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientSingleton };

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
})

export default prisma;

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}