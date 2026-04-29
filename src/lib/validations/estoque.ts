import { z } from "zod";
import { idSchema, optionalText, positiveDecimal } from "./shared";

export const stockMovementSchema = z.object({
  agentId: idSchema,
  type: z.enum(["ENTRADA", "SAIDA"], {
    required_error: "Tipo de movimentação é obrigatório."
  }),
  quantity: positiveDecimal("Quantidade"),
  note: optionalText(500)
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
