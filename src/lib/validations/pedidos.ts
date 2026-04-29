import { z } from "zod";
import { idSchema, optionalDate, optionalText, positiveDecimal } from "./shared";

export const restockRequestSchema = z.object({
  agentId: idSchema,
  requestedQuantity: positiveDecimal("Quantidade solicitada"),
  expectedDate: optionalDate,
  notes: optionalText(600)
});

export const orderFilterSchema = z.object({
  status: z
    .enum(["ALL", "PENDENTE", "APROVADO", "RECEBIDO", "CANCELADO"])
    .optional()
    .default("ALL"),
  page: z.coerce.number().int().min(1).optional().default(1)
});

export type RestockRequestInput = z.infer<typeof restockRequestSchema>;
