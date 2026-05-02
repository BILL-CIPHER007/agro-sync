import { z } from "zod";
import { idSchema, optionalDate, optionalText, positiveDecimal } from "./shared";

export const stockMovementSchema = z.object({
  agentId: idSchema,
  type: z.enum(["ENTRADA", "SAIDA"], {
    required_error: "Tipo de movimentação é obrigatório."
  }),
  quantity: positiveDecimal("Quantidade"),
  note: optionalText(500)
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;

export const stockHistoryFilterSchema = z
  .object({
    agentId: z.preprocess(
      (value) => {
        if (typeof value !== "string") return value;
        return value.trim() ? value : undefined;
      },
      idSchema.optional()
    ),
    type: z.preprocess(
      (value) => {
        if (typeof value !== "string") return value;
        return value.trim() ? value : "ALL";
      },
      z.enum(["ALL", "ENTRADA", "SAIDA"]).default("ALL")
    ),
    startDate: optionalDate,
    endDate: optionalDate,
    page: z.coerce.number().int().min(1).optional().default(1)
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "A data final deve ser maior ou igual a data inicial."
      });
    }
  });

export type StockHistoryFilter = z.infer<typeof stockHistoryFilterSchema>;
