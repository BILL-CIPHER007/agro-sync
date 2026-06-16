import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { requireUser } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={user.role} />
      <div className="print:pl-0 md:pl-64">
        <Header name={user.name} role={user.role} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 print:max-w-none print:p-0 md:px-6">{children}</main>
      </div>
    </div>
  );
}
