import { MovementType, Prisma, PrismaClient, RestockStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_DESCRIPTION = "Registro demonstrativo para visualizacao da interface do AgroSync.";
const DEMO_NOTE = "[DEMO AgroSync]";

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function upsertDemoAgent(data: {
  name: string;
  category: string;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
}) {
  const existing = await prisma.agriculturalAgent.findFirst({
    where: {
      name: data.name,
      description: DEMO_DESCRIPTION
    }
  });

  const payload = {
    name: data.name,
    category: data.category,
    unit: data.unit,
    description: DEMO_DESCRIPTION,
    currentQuantity: new Prisma.Decimal(data.currentQuantity),
    minimumQuantity: new Prisma.Decimal(data.minimumQuantity)
  };

  if (existing) {
    return prisma.agriculturalAgent.update({
      where: { id: existing.id },
      data: payload
    });
  }

  return prisma.agriculturalAgent.create({ data: payload });
}

async function ensureMovement(data: {
  agentId: string;
  userId: string;
  restockRequestId?: string;
  type: MovementType;
  quantity: number;
  note: string;
  createdAt: Date;
}) {
  const existing = await prisma.stockMovement.findFirst({
    where: {
      agentId: data.agentId,
      note: data.note
    }
  });

  if (existing) return existing;

  return prisma.stockMovement.create({
    data: {
      agentId: data.agentId,
      userId: data.userId,
      restockRequestId: data.restockRequestId,
      type: data.type,
      quantity: new Prisma.Decimal(data.quantity),
      note: data.note,
      createdAt: data.createdAt
    }
  });
}

async function upsertRequest(data: {
  agentId: string;
  userId: string;
  requestedQuantity: number;
  status: RestockStatus;
  expectedDate?: Date;
  receivedDate?: Date;
  notes: string;
}) {
  const existing = await prisma.restockRequest.findFirst({
    where: {
      agentId: data.agentId,
      notes: data.notes
    }
  });

  const payload = {
    userId: data.userId,
    requestedQuantity: new Prisma.Decimal(data.requestedQuantity),
    status: data.status,
    expectedDate: data.expectedDate,
    receivedDate: data.receivedDate,
    notes: data.notes
  };

  if (existing) {
    return prisma.restockRequest.update({
      where: { id: existing.id },
      data: payload
    });
  }

  return prisma.restockRequest.create({
    data: {
      agentId: data.agentId,
      ...payload
    }
  });
}

async function main() {
  const admin =
    (await prisma.user.findUnique({ where: { email: "admin@agrosync.local" } })) ??
    (await prisma.user.create({
      data: {
        name: "Administrador AgroSync",
        email: "admin@agrosync.local",
        passwordHash: await bcrypt.hash("Admin@12345", 12),
        role: Role.ADMIN
      }
    }));

  const operator = await prisma.user.upsert({
    where: { email: "operador@agrosync.local" },
    update: {
      name: "Operador Demo",
      role: Role.OPERADOR
    },
    create: {
      name: "Operador Demo",
      email: "operador@agrosync.local",
      passwordHash: await bcrypt.hash("Operador@12345", 12),
      role: Role.OPERADOR
    }
  });

  const agents = await Promise.all([
    upsertDemoAgent({
      name: "Glifosato 480 SL",
      category: "Herbicida",
      unit: "L",
      currentQuantity: 120,
      minimumQuantity: 50
    }),
    upsertDemoAgent({
      name: "Ureia Granulada",
      category: "Fertilizante",
      unit: "saco",
      currentQuantity: 8,
      minimumQuantity: 15
    }),
    upsertDemoAgent({
      name: "Calda Bordalesa",
      category: "Fungicida",
      unit: "kg",
      currentQuantity: 35,
      minimumQuantity: 20
    }),
    upsertDemoAgent({
      name: "Inseticida Biologico BT",
      category: "Inseticida",
      unit: "L",
      currentQuantity: 6,
      minimumQuantity: 10
    }),
    upsertDemoAgent({
      name: "Sementes de Cobertura",
      category: "Semente",
      unit: "kg",
      currentQuantity: 420,
      minimumQuantity: 200
    })
  ]);

  const [glifosato, ureia, calda, inseticida, sementes] = agents;

  await Promise.all([
    ensureMovement({
      agentId: glifosato.id,
      userId: admin.id,
      type: MovementType.ENTRADA,
      quantity: 150,
      note: `${DEMO_NOTE} Entrada inicial - Glifosato 480 SL`,
      createdAt: daysFromNow(-9)
    }),
    ensureMovement({
      agentId: glifosato.id,
      userId: operator.id,
      type: MovementType.SAIDA,
      quantity: 30,
      note: `${DEMO_NOTE} Aplicacao em talhao norte`,
      createdAt: daysFromNow(-3)
    }),
    ensureMovement({
      agentId: ureia.id,
      userId: operator.id,
      type: MovementType.SAIDA,
      quantity: 7,
      note: `${DEMO_NOTE} Adubacao de cobertura`,
      createdAt: daysFromNow(-2)
    }),
    ensureMovement({
      agentId: calda.id,
      userId: admin.id,
      type: MovementType.ENTRADA,
      quantity: 35,
      note: `${DEMO_NOTE} Compra emergencial de fungicida`,
      createdAt: daysFromNow(-6)
    }),
    ensureMovement({
      agentId: sementes.id,
      userId: operator.id,
      type: MovementType.ENTRADA,
      quantity: 420,
      note: `${DEMO_NOTE} Recebimento para cobertura de solo`,
      createdAt: daysFromNow(-4)
    })
  ]);

  await Promise.all([
    upsertRequest({
      agentId: ureia.id,
      userId: operator.id,
      requestedQuantity: 30,
      status: RestockStatus.PENDENTE,
      expectedDate: daysFromNow(5),
      notes: `${DEMO_NOTE} Reposicao por estoque baixo - Ureia Granulada`
    }),
    upsertRequest({
      agentId: inseticida.id,
      userId: operator.id,
      requestedQuantity: 12,
      status: RestockStatus.APROVADO,
      expectedDate: daysFromNow(3),
      notes: `${DEMO_NOTE} Pedido aprovado para controle biologico`
    }),
    upsertRequest({
      agentId: glifosato.id,
      userId: admin.id,
      requestedQuantity: 40,
      status: RestockStatus.CANCELADO,
      expectedDate: daysFromNow(7),
      notes: `${DEMO_NOTE} Pedido cancelado por saldo suficiente`
    })
  ]);

  const receivedRequest = await upsertRequest({
    agentId: calda.id,
    userId: admin.id,
    requestedQuantity: 20,
    status: RestockStatus.RECEBIDO,
    expectedDate: daysFromNow(-1),
    receivedDate: daysFromNow(-1),
    notes: `${DEMO_NOTE} Pedido recebido para recompor fungicida`
  });

  await ensureMovement({
    agentId: calda.id,
    userId: admin.id,
    restockRequestId: receivedRequest.id,
    type: MovementType.ENTRADA,
    quantity: 20,
    note: `${DEMO_NOTE} Recebimento do pedido demonstrativo`,
    createdAt: daysFromNow(-1)
  });

  console.log("Dados demonstrativos inseridos/atualizados com sucesso.");
  console.log("Usuario operador demo: operador@agrosync.local / Operador@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
