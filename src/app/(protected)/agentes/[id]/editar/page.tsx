import { notFound } from "next/navigation";
import { AgentForm } from "@/components/agentes/agent-form";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditAgentPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const agent = await prisma.agriculturalAgent.findUnique({
    where: { id: params.id }
  });

  if (!agent) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Editar agente agrícola" description={agent.name} />
      <AgentForm
        agentId={agent.id}
        initialValues={{
          name: agent.name,
          category: agent.category,
          unit: agent.unit,
          description: agent.description ?? "",
          currentQuantity: toNumber(agent.currentQuantity),
          minimumQuantity: toNumber(agent.minimumQuantity)
        }}
      />
    </div>
  );
}
