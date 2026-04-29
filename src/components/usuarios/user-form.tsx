"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createUserAction } from "@/lib/actions/usuarios";
import { type ActionResult } from "@/lib/utils";
import { userCreateSchema, type UserCreateInput } from "@/lib/validations/usuarios";

export function UserForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<UserCreateInput>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "OPERADOR"
    }
  });

  function onSubmit(values: UserCreateInput) {
    setResult(null);

    startTransition(async () => {
      const response = await createUserAction(values);
      setResult(response);

      if (response.ok) {
        reset({
          name: "",
          email: "",
          password: "",
          role: "OPERADOR"
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          {result ? <Alert variant={result.ok ? "success" : "destructive"}>{result.message}</Alert> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
              {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Perfil</Label>
              <Select id="role" {...register("role")}>
                <option value="OPERADOR">Operador</option>
                <option value="ADMIN">Admin</option>
              </Select>
              {errors.role ? <p className="text-sm text-destructive">{errors.role.message}</p> : null}
            </div>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Criando..." : "Criar usuário"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
