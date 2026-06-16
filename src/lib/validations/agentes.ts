import { z } from "zod";
import { nonNegativeDecimal, optionalText, requiredText } from "./shared";

const optionalDateInput = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    return value.trim() ? value : undefined;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data valida.")
    .refine((value) => !Number.isNaN(Date.parse(`${value}T12:00:00.000Z`)), "Informe uma data valida.")
    .optional()
);

export const agentSchema = z.object({
  name: requiredText("Nome", 120),
  category: requiredText("Categoria", 80),
  unit: requiredText("Unidade", 30),
  description: optionalText(600),
  supplier: optionalText(120),
  shipmentNumber: optionalText(80),
  expirationDate: optionalDateInput,
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
