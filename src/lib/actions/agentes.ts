"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { agentSchema, type AgentInput } from "@/lib/validations/agentes";
import { idSchema } from "@/lib/validations/shared";
import { failure, success } from "@/lib/utils";
import { actionFailure, BusinessError, validationFailure } from "./helpers";

function parseExpirationDate(value: string | undefined) {
  return value ? new Date(`${value}T12:00:00.000Z`) : null;
}

export async function createAgentAction(values: AgentInput) {
  await requireAdmin();

  const parsed = agentSchema.safeParse(values);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    await prisma.agriculturalAgent.create({
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
        unit: parsed.data.unit,
        description: parsed.data.description,
        supplier: parsed.data.supplier,
        shipmentNumber: parsed.data.shipmentNumber,
        expirationDate: parseExpirationDate(parsed.data.expirationDate),
        currentQuantity: new Prisma.Decimal(parsed.data.currentQuantity),
        minimumQuantity: new Prisma.Decimal(parsed.data.minimumQuantity)
      }
    });

    revalidatePath("/agentes");
    revalidatePath("/estoque");
    revalidatePath("/dashboard");
    revalidatePath("/relatorios");

    return success("Agente agrícola cadastrado com sucesso.");
  } catch (error) {
    return actionFailure(error, "Não foi possível cadastrar o agente agrícola.");
  }
}

export async function updateAgentAction(id: string, values: AgentInput) {
  await requireAdmin();

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return failure("Agente agrícola inválido.");

  const parsed = agentSchema.safeParse(values);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    await prisma.agriculturalAgent.update({
      where: { id: parsedId.data },
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
        unit: parsed.data.unit,
        description: parsed.data.description,
        supplier: parsed.data.supplier,
        shipmentNumber: parsed.data.shipmentNumber,
        expirationDate: parseExpirationDate(parsed.data.expirationDate),
        currentQuantity: new Prisma.Decimal(parsed.data.currentQuantity),
        minimumQuantity: new Prisma.Decimal(parsed.data.minimumQuantity)
      }
    });

    revalidatePath("/agentes");
    revalidatePath("/estoque");
    revalidatePath("/dashboard");
    revalidatePath("/relatorios");

    return success("Agente agrícola atualizado com sucesso.");
  } catch (error) {
    return actionFailure(error, "Não foi possível atualizar o agente agrícola.");
  }
}

export async function deleteAgentAction(id: string) {
  await requireAdmin();

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return failure("Agente agrícola inválido.");

  try {
    const dependencies = await prisma.agriculturalAgent.findUnique({
      where: { id: parsedId.data },
      select: {
        _count: {
          select: {
            stockMovements: true,
            restockRequests: true
          }
        }
      }
    });

    if (!dependencies) {
      throw new BusinessError("Agente agrícola não encontrado.");
    }

    if (dependencies._count.stockMovements > 0 || dependencies._count.restockRequests > 0) {
      throw new BusinessError("Este agente possui movimentações ou pedidos vinculados e não pode ser excluído.");
    }

    await prisma.agriculturalAgent.delete({ where: { id: parsedId.data } });

    revalidatePath("/agentes");
    revalidatePath("/dashboard");
    revalidatePath("/relatorios");

    return success("Agente agrícola excluído com sucesso.");
  } catch (error) {
    return actionFailure(error, "Não foi possível excluir o agente agrícola.");
  }
}
