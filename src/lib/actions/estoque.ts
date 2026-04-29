"use server";

import { MovementType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { stockMovementSchema, type StockMovementInput } from "@/lib/validations/estoque";
import { success } from "@/lib/utils";
import { actionFailure, BusinessError, validationFailure } from "./helpers";

export async function registerStockMovementAction(values: StockMovementInput) {
  const user = await requireUser();

  const parsed = stockMovementSchema.safeParse(values);
  if (!parsed.success) return validationFailure(parsed.error);

  const quantity = new Prisma.Decimal(parsed.data.quantity);

  try {
    await prisma.$transaction(async (tx) => {
      const agent = await tx.agriculturalAgent.findUnique({
        where: { id: parsed.data.agentId },
        select: { id: true }
      });

      if (!agent) {
        throw new BusinessError("Agente agrícola não encontrado.");
      }

      if (parsed.data.type === MovementType.SAIDA) {
        const updated = await tx.agriculturalAgent.updateMany({
          where: {
            id: parsed.data.agentId,
            currentQuantity: { gte: quantity }
          },
          data: {
            currentQuantity: { decrement: quantity }
          }
        });

        if (updated.count !== 1) {
          throw new BusinessError("Estoque insuficiente para registrar a saída.");
        }
      } else {
        await tx.agriculturalAgent.update({
          where: { id: parsed.data.agentId },
          data: {
            currentQuantity: { increment: quantity }
          }
        });
      }

      await tx.stockMovement.create({
        data: {
          agentId: parsed.data.agentId,
          userId: user.id,
          type: parsed.data.type,
          quantity,
          note: parsed.data.note
        }
      });
    });

    revalidatePath("/estoque");
    revalidatePath("/agentes");
    revalidatePath("/dashboard");

    return success("Movimentação registrada com sucesso.");
  } catch (error) {
    return actionFailure(error, "Não foi possível registrar a movimentação.");
  }
}
