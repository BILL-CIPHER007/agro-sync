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
import { Textarea } from "@/components/ui/textarea";
import { createAgentAction, updateAgentAction } from "@/lib/actions/agentes";
import { type ActionResult } from "@/lib/utils";
import { agentSchema, type AgentInput } from "@/lib/validations/agentes";

type AgentFormProps = {
  agentId?: string;
  initialValues?: AgentInput;
};

export function AgentForm({ agentId, initialValues }: AgentFormProps) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AgentInput>({
    resolver: zodResolver(agentSchema),
    defaultValues: initialValues ?? {
      name: "",
      category: "",
      unit: "kg",
      description: "",
      currentQuantity: 0,
      minimumQuantity: 0
    }
  });

  function onSubmit(values: AgentInput) {
    setResult(null);

    startTransition(async () => {
      const response = agentId ? await updateAgentAction(agentId, values) : await createAgentAction(values);
      setResult(response);

      if (response.ok) {
        router.push("/agentes");
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
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" placeholder="Defensivo, Fertilizante..." {...register("category")} />
              {errors.category ? <p className="text-sm text-destructive">{errors.category.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade de medida</Label>
              <Input id="unit" placeholder="kg, L, unidade, saco" {...register("unit")} />
              {errors.unit ? <p className="text-sm text-destructive">{errors.unit.message}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentQuantity">Quantidade atual</Label>
                <Input id="currentQuantity" type="number" min="0" step="0.01" {...register("currentQuantity")} />
                {errors.currentQuantity ? (
                  <p className="text-sm text-destructive">{errors.currentQuantity.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumQuantity">Estoque mínimo</Label>
                <Input id="minimumQuantity" type="number" min="0" step="0.01" {...register("minimumQuantity")} />
                {errors.minimumQuantity ? (
                  <p className="text-sm text-destructive">{errors.minimumQuantity.message}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/agentes")}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
