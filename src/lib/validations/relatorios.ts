import { z } from "zod";
import { idSchema } from "./shared";

const optionalId = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    return value.trim() ? value : undefined;
  },
  idSchema.optional()
);

const optionalDateInput = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    return value.trim() ? value : undefined;
  },
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida.").optional()
);

export const movementReportFilterSchema = z
  .object({
    agentId: optionalId,
    type: z.preprocess(
      (value) => {
        if (typeof value !== "string") return value;
        return value.trim() ? value : "ALL";
      },
      z.enum(["ALL", "ENTRADA", "SAIDA"]).default("ALL")
    ),
    startDate: optionalDateInput,
    endDate: optionalDateInput,
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

export type MovementReportFilter = z.infer<typeof movementReportFilterSchema>;
