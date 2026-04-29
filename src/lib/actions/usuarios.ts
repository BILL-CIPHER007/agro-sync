"use server";

import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { userCreateSchema, type UserCreateInput } from "@/lib/validations/usuarios";
import { success } from "@/lib/utils";
import { actionFailure, BusinessError, validationFailure } from "./helpers";

export async function createUserAction(values: UserCreateInput) {
  await requireAdmin();

  const parsed = userCreateSchema.safeParse(values);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      select: { id: true }
    });

    if (existing) {
      throw new BusinessError("Já existe um usuário com este e-mail.");
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        role: parsed.data.role as Role
      }
    });

    revalidatePath("/usuarios");

    return success("Usuário criado com sucesso.");
  } catch (error) {
    return actionFailure(error, "Não foi possível criar o usuário.");
  }
}
