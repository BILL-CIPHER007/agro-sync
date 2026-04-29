"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAgentAction } from "@/lib/actions/agentes";

export function AgentRowActions({ agentId, isAdmin }: { agentId: string; isAdmin: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAdmin) return null;

  function onDelete() {
    const confirmed = window.confirm("Excluir este agente agrícola?");
    if (!confirmed) return;

    setMessage(null);
    startTransition(async () => {
      const result = await deleteAgentAction(agentId);
      setMessage(result.ok ? null : result.message);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {message ? <span className="max-w-48 text-xs text-destructive">{message}</span> : null}
      <Button asChild variant="outline" size="icon" title="Editar" aria-label="Editar">
        <Link href={`/agentes/${agentId}/editar`}>
          <Edit className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        title="Excluir"
        aria-label="Excluir"
        disabled={isPending}
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
