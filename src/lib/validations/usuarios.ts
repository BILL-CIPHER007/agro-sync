import { z } from "zod";
import { requiredText } from "./shared";

export const userCreateSchema = z.object({
  name: requiredText("Nome", 120),
  email: z.string().trim().email("Informe um e-mail válido.").max(180),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(120, "Senha muito longa."),
  role: z.enum(["ADMIN", "OPERADOR"])
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
