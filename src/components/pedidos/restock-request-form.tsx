"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createRestockRequestAction } from "@/lib/actions/pedidos";
import { type ActionResult } from "@/lib/utils";
import { restockRequestSchema, type RestockRequestInput } from "@/lib/validations/pedidos";

type AgentOption = {
  id: string;
  name: string;
  unit: string;
};

export function RestockRequestForm({ agents }: { agents: AgentOption[] }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RestockRequestInput>({
    resolver: zodResolver(restockRequestSchema),
    defaultValues: {
      agentId: agents[0]?.id ?? "",
      requestedQuantity: 1,
      expectedDate: undefined,
      notes: ""
    }
  });

  function onSubmit(values: RestockRequestInput) {
    setResult(null);

    startTransition(async () => {
      const response = await createRestockRequestAction(values);
      setResult(response);

      if (response.ok) {
        router.push("/pedidos");
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
          {result ? <Alert variant={result.ok ? "success" : "destructive"}>{result.message}</Alert> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agentId">Agente agrícola</Label>
              <Select id="agentId" disabled={!agents.length} {...register("agentId")}>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.unit})
                  </option>
                ))}
              </Select>
              {errors.agentId ? <p className="text-sm text-destructive">{errors.agentId.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestedQuantity">Quantidade solicitada</Label>
              <Input id="requestedQuantity" type="number" min="0.01" step="0.01" {...register("requestedQuantity")} />
              {errors.requestedQuantity ? (
                <p className="text-sm text-destructive">{errors.requestedQuantity.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedDate">Data prevista</Label>
              <Input id="expectedDate" type="date" {...register("expectedDate")} />
              {errors.expectedDate ? <p className="text-sm text-destructive">{errors.expectedDate.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" {...register("notes")} />
            {errors.notes ? <p className="text-sm text-destructive">{errors.notes.message}</p> : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isPending || !agents.length}>
              {isPending ? "Criando..." : "Criar pedido"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/pedidos")}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
