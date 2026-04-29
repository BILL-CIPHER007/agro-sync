import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed bloqueado em ambiente de produção.");
  }

  const email = "admin@agrosync.local";
  const passwordHash = await bcrypt.hash("Admin@12345", 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Administrador AgroSync",
      role: Role.ADMIN
    },
    create: {
      name: "Administrador AgroSync",
      email,
      passwordHash,
      role: Role.ADMIN
    }
  });

  console.log("Seed concluído. Usuário ADMIN: admin@agrosync.local / Admin@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
