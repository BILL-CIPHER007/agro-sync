import { Boxes } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

function safeCallbackUrl(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export default function LoginPage({
  searchParams
}: {
  searchParams: { callbackUrl?: string | string[] };
}) {
  const callbackUrl = safeCallbackUrl(searchParams.callbackUrl);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(140deg,#f7fbf7_0%,#eef7ef_45%,#fff8e8_100%)] px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-[1fr_430px] md:items-center">
        <section className="space-y-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Boxes className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">AgroSync</p>
            <h1 className="max-w-xl text-3xl font-semibold tracking-normal text-foreground md:text-5xl">
              Gestão segura de estoque para agentes agrícolas.
            </h1>
            <p className="max-w-lg text-base text-muted-foreground">
              Controle produtos, movimentações e pedidos de abastecimento com perfis de acesso e validações no servidor.
            </p>
          </div>
        </section>

        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
