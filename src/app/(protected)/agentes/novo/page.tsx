import { AgentForm } from "@/components/agentes/agent-form";
import { PageHeader } from "@/components/shared/page-header";
import { requireAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function NewAgentPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="Novo agente agrícola" description="Cadastre um item controlado no estoque." />
      <AgentForm />
    </div>
  );
}
