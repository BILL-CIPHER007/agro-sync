import { z } from "zod";
import { nonNegativeDecimal, optionalText, requiredText } from "./shared";

export const agentSchema = z.object({
  name: requiredText("Nome", 120),
  category: requiredText("Categoria", 80),
  unit: requiredText("Unidade", 30),
  description: optionalText(600),
  currentQuantity: nonNegativeDecimal("Quantidade atual"),
  minimumQuantity: nonNegativeDecimal("Quantidade mínima")
});

export const agentFilterSchema = z.object({
  q: z.string().trim().optional().default(""),
  category: z.string().trim().optional().default(""),
  stockStatus: z.enum(["ALL", "OK", "LOW"]).optional().default("ALL"),
  page: z.coerce.number().int().min(1).optional().default(1)
});

export type AgentInput = z.infer<typeof agentSchema>;
