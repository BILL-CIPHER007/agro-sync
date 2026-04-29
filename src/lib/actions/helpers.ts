import { ZodError } from "zod";
import { failure } from "@/lib/utils";

export class BusinessError extends Error {}

export function validationFailure(error: ZodError) {
  return failure(error.issues[0]?.message ?? "Dados inválidos.");
}

export function actionFailure(error: unknown, fallback = "Não foi possível concluir a operação.") {
  if (error instanceof BusinessError) {
    return failure(error.message);
  }

  return failure(fallback);
}
