import { PrismaClient } from '@prisma/client'

const localDbUrl = "postgresql://postgres:postgres@localhost:5433/gzlaeo_db?schema=public"

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL || localDbUrl
  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
