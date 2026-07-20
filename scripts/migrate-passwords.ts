import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Migration started: Plain text passwords to Bcrypt hashes...");
  
  const users = await prisma.user.findMany();
  let migratedCount = 0;

  for (const user of users) {
    // Check if the password is already a bcrypt hash (starts with $2a$ or $2b$)
    if (!user.password.startsWith("$2a$") && !user.password.startsWith("$2b$")) {
      console.log(`Migrating password for user: ${user.email}`);
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      migratedCount++;
    } else {
      console.log(`User ${user.email} is already hashed. Skipping.`);
    }
  }

  console.log(`Migration completed. ${migratedCount} users migrated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
