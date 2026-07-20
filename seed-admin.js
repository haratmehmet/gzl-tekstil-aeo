const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Create default admin user if not exists
  const adminEmail = 'yonetici@gzlaeo.com'
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: 'admin', // in a real app this would be hashed
        name: 'Yönetici',
        role: 'ADMIN'
      }
    })
    console.log('Created default admin user: ' + adminEmail)
  }

  // Create default system settings if not exists
  const settings = await prisma.systemSettings.findUnique({ where: { id: 'global' } })
  if (!settings) {
    await prisma.systemSettings.create({
      data: {
        id: 'global',
        companyName: 'GZL TEKSTİL'
      }
    })
    console.log('Created default system settings')
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
