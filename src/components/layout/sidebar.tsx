"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ClipboardList, LayoutDashboard, PackageSearch, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "ADMIN" | "OPERADOR";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "OPERADOR"] },
  { href: "/agentes", label: "Agentes Agrícolas", icon: PackageSearch, roles: ["ADMIN", "OPERADOR"] },
  { href: "/estoque", label: "Estoque", icon: Boxes, roles: ["ADMIN", "OPERADOR"] },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList, roles: ["ADMIN", "OPERADOR"] },
  { href: "/usuarios", label: "Usuários", icon: Users, roles: ["ADMIN"] }
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const availableItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="border-b bg-white md:fixed md:inset-y-0 md:left-0 md:z-20 md:w-64 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Boxes className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-semibold">AgroSync</p>
            <p className="text-xs text-muted-foreground">Estoque agrícola</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible">
          {availableItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-w-max items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:min-w-0",
                  active && "bg-secondary text-primary"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
