import { z } from "zod";
import { requiredText } from "./shared";

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido.").max(180),
  password: requiredText("Senha", 120)
});

export type LoginInput = z.infer<typeof loginSchema>;
