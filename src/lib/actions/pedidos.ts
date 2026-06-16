"use server";

import { MovementType, Prisma, RestockStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/permissions";
import { restockRequestSchema, type RestockRequestInput } from "@/lib/validations/pedidos";
import { idSchema } from "@/lib/validations/shared";
import { failure, success } from "@/lib/utils";
import { actionFailure, BusinessError, validationFailure } from "./helpers";

export async function createRestockRequestAction(values: RestockRequestInput) {
  const user = await requireUser();

  const parsed = restockRequestSchema.safeParse(values);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const agent = await prisma.agriculturalAgent.findUnique({
      where: { id: parsed.data.agentId },
      select: { id: true }
    });

    if (!agent) {
      throw new BusinessError("Agente agrícola não encontrado.");
    }

    await prisma.restockRequest.create({
      data: {
        agentId: parsed.data.agentId,
        userId: user.id,
        requestedQuantity: new Prisma.Decimal(parsed.data.requestedQuantity),
        expectedDate: parsed.data.expectedDate,
        notes: parsed.data.notes
      }
    });

    revalidatePath("/pedidos");
    revalidatePath("/dashboard");

    return success("Pedido de abastecimento criado com sucesso.");
  } catch (error) {
    return actionFailure(error, "Não foi possível criar o pedido.");
  }
}

export async function approveRestockRequestAction(id: string) {
  await requireAdmin();

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return failure("Pedido inválido.");

  try {
    const updated = await prisma.restockRequest.updateMany({
      where: {
        id: parsedId.data,
        status: RestockStatus.PENDENTE
      },
      data: {
        status: RestockStatus.APROVADO
      }
    });

    if (updated.count !== 1) {
      throw new BusinessError("Apenas pedidos pendentes podem ser aprovados.");
    }

    revalidatePath("/pedidos");
    revalidatePath("/dashboard");

    return success("Pedido aprovado com sucesso.");
  } catch (error) {
    return actionFailure(error, "Não foi possível aprovar o pedido.");
  }
}

export async function cancelRestockRequestAction(id: string) {
  await requireAdmin();

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return failure("Pedido inválido.");

  try {
    const updated = await prisma.restockRequest.updateMany({
      where: {
        id: parsedId.data,
        status: { in: [RestockStatus.PENDENTE, RestockStatus.APROVADO] }
      },
      data: {
        status: RestockStatus.CANCELADO
      }
    });

    if (updated.count !== 1) {
      throw new BusinessError("Pedidos recebidos ou já cancelados não podem ser cancelados.");
    }

    revalidatePath("/pedidos");
    revalidatePath("/dashboard");

    return success("Pedido cancelado com sucesso.");
  } catch (error) {
    return actionFailure(error, "Não foi possível cancelar o pedido.");
  }
}

export async function receiveRestockRequestAction(id: string) {
  const user = await requireUser();

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return failure("Pedido inválido.");

  try {
    await prisma.$transaction(async (tx) => {
      const request = await tx.restockRequest.findUnique({
        where: { id: parsedId.data },
        select: {
          id: true,
          agentId: true,
          requestedQuantity: true,
          status: true
        }
      });

      if (!request) {
        throw new BusinessError("Pedido não encontrado.");
      }

      if (request.status === RestockStatus.RECEBIDO) {
        throw new BusinessError("Este pedido já foi recebido.");
      }

      if (request.status === RestockStatus.CANCELADO) {
        throw new BusinessError("Pedido cancelado não pode ser recebido.");
      }

      if (request.status !== RestockStatus.APROVADO) {
        throw new BusinessError("Apenas pedidos aprovados podem ser recebidos.");
      }

      const updated = await tx.restockRequest.updateMany({
        where: {
          id: request.id,
          status: RestockStatus.APROVADO
        },
        data: {
          status: RestockStatus.RECEBIDO,
          receivedDate: new Date()
        }
      });

      if (updated.count !== 1) {
        throw new BusinessError("O pedido foi alterado por outro usuário. Recarregue a página.");
      }

      await tx.agriculturalAgent.update({
        where: { id: request.agentId },
        data: {
          currentQuantity: { increment: request.requestedQuantity }
        }
      });

      await tx.stockMovement.create({
        data: {
          agentId: request.agentId,
          userId: user.id,
          restockRequestId: request.id,
          type: MovementType.ENTRADA,
          quantity: request.requestedQuantity,
          note: `Recebimento do pedido ${request.id}`
        }
      });
    });

    revalidatePath("/pedidos");
    revalidatePath("/estoque");
    revalidatePath("/agentes");
    revalidatePath("/dashboard");
    revalidatePath("/relatorios");

    return success("Pedido recebido e estoque atualizado.");
  } catch (error) {
    return actionFailure(error, "Não foi possível receber o pedido.");
  }
}
