"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, PackageCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  approveRestockRequestAction,
  cancelRestockRequestAction,
  receiveRestockRequestAction
} from "@/lib/actions/pedidos";

type Props = {
  requestId: string;
  status: "PENDENTE" | "APROVADO" | "RECEBIDO" | "CANCELADO";
  role: "ADMIN" | "OPERADOR";
};

export function RestockRequestActions({ requestId, status, role }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage(result.ok ? null : result.message);
      router.refresh();
    });
  }

  const canApprove = role === "ADMIN" && status === "PENDENTE";
  const canCancel = role === "ADMIN" && (status === "PENDENTE" || status === "APROVADO");
  const canReceive = status === "APROVADO";

  if (!canApprove && !canCancel && !canReceive) return null;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {message ? <span className="max-w-56 text-xs text-destructive">{message}</span> : null}

      {canApprove ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Aprovar"
          aria-label="Aprovar"
          disabled={isPending}
          onClick={() => run(() => approveRestockRequestAction(requestId))}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
        </Button>
      ) : null}

      {canReceive ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Receber"
          aria-label="Receber"
          disabled={isPending}
          onClick={() => run(() => receiveRestockRequestAction(requestId))}
        >
          <PackageCheck className="h-4 w-4" aria-hidden="true" />
        </Button>
      ) : null}

      {canCancel ? (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          title="Cancelar"
          aria-label="Cancelar"
          disabled={isPending}
          onClick={() => run(() => cancelRestockRequestAction(requestId))}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
