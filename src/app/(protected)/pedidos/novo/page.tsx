import { RestockRequestForm } from "@/components/pedidos/restock-request-form";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function NewRestockRequestPage() {
  await requireUser();

  const agents = await prisma.agriculturalAgent.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      unit: true
    }
  });

  return (
    <div>
      <PageHeader title="Novo pedido de abastecimento" description="Crie uma solicitação para reposição de estoque." />
      <RestockRequestForm agents={agents} />
    </div>
  );
}
