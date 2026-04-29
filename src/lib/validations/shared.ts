import { z } from "zod";

export const idSchema = z.string().cuid("Identificador inválido.");

export const requiredText = (field: string, max = 120) =>
  z
    .string({ required_error: `${field} é obrigatório.` })
    .trim()
    .min(1, `${field} é obrigatório.`)
    .max(max, `${field} deve ter no máximo ${max} caracteres.`);

export const optionalText = (max = 500) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    },
    z.string().max(max, `Use no máximo ${max} caracteres.`).optional()
  );

export const nonNegativeDecimal = (field: string) =>
  z.coerce
    .number({ invalid_type_error: `${field} deve ser um número.` })
    .finite(`${field} deve ser um número válido.`)
    .min(0, `${field} não pode ser negativo.`);

export const positiveDecimal = (field: string) =>
  z.coerce
    .number({ invalid_type_error: `${field} deve ser um número.` })
    .finite(`${field} deve ser um número válido.`)
    .positive(`${field} deve ser maior que zero.`);

export const optionalDate = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    return value.trim() ? value : undefined;
  },
  z.coerce.date().optional()
);
