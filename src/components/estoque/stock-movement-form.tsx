"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { registerStockMovementAction } from "@/lib/actions/estoque";
import { type ActionResult, formatQuantity } from "@/lib/utils";
import { stockMovementSchema, type StockMovementInput } from "@/lib/validations/estoque";

type AgentOption = {
  id: string;
  name: string;
  unit: string;
  currentQuantity: number;
};

export function StockMovementForm({ agents }: { agents: AgentOption[] }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultAgentId = agents[0]?.id ?? "";
  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<StockMovementInput>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      agentId: defaultAgentId,
      type: "ENTRADA",
      quantity: 1,
      note: ""
    }
  });

  const selectedAgentId = watch("agentId");
  const selectedAgent = useMemo(() => agents.find((agent) => agent.id === selectedAgentId), [agents, selectedAgentId]);

  function onSubmit(values: StockMovementInput) {
    setResult(null);

    startTransition(async () => {
      const response = await registerStockMovementAction(values);
      setResult(response);

      if (response.ok) {
        reset({
          agentId: values.agentId,
          type: values.type,
          quantity: 1,
          note: ""
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar movimentação</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          {result ? <Alert variant={result.ok ? "success" : "destructive"}>{result.message}</Alert> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agentId">Agente agrícola</Label>
              <Select id="agentId" disabled={!agents.length} {...register("agentId")}>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </Select>
              {errors.agentId ? <p className="text-sm text-destructive">{errors.agentId.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select id="type" {...register("type")}>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </Select>
              {errors.type ? <p className="text-sm text-destructive">{errors.type.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input id="quantity" type="number" min="0.01" step="0.01" {...register("quantity")} />
              {errors.quantity ? <p className="text-sm text-destructive">{errors.quantity.message}</p> : null}
            </div>

            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Saldo atual</p>
              <p className="mt-1 text-lg font-semibold">
                {selectedAgent ? formatQuantity(selectedAgent.currentQuantity, selectedAgent.unit) : "-"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Observação</Label>
            <Textarea id="note" {...register("note")} />
            {errors.note ? <p className="text-sm text-destructive">{errors.note.message}</p> : null}
          </div>

          <Button type="submit" disabled={isPending || !agents.length}>
            {isPending ? "Registrando..." : "Registrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
