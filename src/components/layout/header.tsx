import { UserCircle } from "lucide-react";
import { SignOutButton } from "@/components/layout/sign-out-button";

export function Header({
  name,
  role
}: {
  name: string | null | undefined;
  role: "ADMIN" | "OPERADOR";
}) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur print:hidden md:px-6">
      <div>
        <p className="text-sm text-muted-foreground">Sistema de gestão</p>
        <h1 className="text-lg font-semibold tracking-normal">AgroSync</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-white">
          <UserCircle className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
