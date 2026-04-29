import Link from "next/link";
import { Plus } from "lucide-react";
import { AgentRowActions } from "@/components/agentes/agent-row-actions";
import { PageHeader } from "@/components/shared/page-header";
import { StockStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { agentFilterSchema } from "@/lib/validations/agentes";
import { formatDate, formatQuantity, isLowStock } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageHref(page: number, filters: { q: string; category: string; stockStatus: string }) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.stockStatus !== "ALL") params.set("stockStatus", filters.stockStatus);
  params.set("page", String(page));
  return `/agentes?${params.toString()}`;
}

export default async function AgentsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const filters = agentFilterSchema.parse({
    q: single(searchParams.q),
    category: single(searchParams.category),
    stockStatus: single(searchParams.stockStatus),
    page: single(searchParams.page)
  });

  const where = {
    ...(filters.q ? { name: { contains: filters.q, mode: "insensitive" as const } } : {}),
    ...(filters.category ? { category: filters.category } : {})
  };

  const [allAgents, categories] = await Promise.all([
    prisma.agriculturalAgent.findMany({
      where,
      orderBy: { name: "asc" }
    }),
    prisma.agriculturalAgent.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" }
    })
  ]);

  const statusFiltered = allAgents.filter((agent) => {
    const low = isLowStock(agent.currentQuantity, agent.minimumQuantity);
    if (filters.stockStatus === "LOW") return low;
    if (filters.stockStatus === "OK") return !low;
    return true;
  });

  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(statusFiltered.length / pageSize));
  const currentPage = Math.min(filters.page, pageCount);
  const agents = statusFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const isAdmin = user.role === "ADMIN";

  return (
    <div>
      <PageHeader
        title="Agentes Agrícolas"
        description="Cadastro e consulta de produtos controlados no estoque."
        actions={
          isAdmin ? (
            <Button asChild>
              <Link href="/agentes/novo">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Novo agente
              </Link>
            </Button>
          ) : null
        }
      />

      <Card className="mb-5">
        <CardContent className="pt-5">
          <form className="grid gap-3 md:grid-cols-[1fr_220px_180px_auto]" action="/agentes">
            <Input name="q" placeholder="Buscar por nome" defaultValue={filters.q} />
            <Select name="category" defaultValue={filters.category}>
              <option value="">Todas as categorias</option>
              {categories.map((item) => (
                <option key={item.category} value={item.category}>
                  {item.category}
                </option>
              ))}
            </Select>
            <Select name="stockStatus" defaultValue={filters.stockStatus}>
              <option value="ALL">Todos os status</option>
              <option value="OK">OK</option>
              <option value="LOW">Estoque baixo</option>
            </Select>
            <Button type="submit" variant="outline">
              Filtrar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualizado em</TableHead>
                {isAdmin ? <TableHead className="text-right">Ações</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.length ? (
                agents.map((agent) => {
                  const low = isLowStock(agent.currentQuantity, agent.minimumQuantity);

                  return (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>{agent.category}</TableCell>
                      <TableCell>{agent.unit}</TableCell>
                      <TableCell>{formatQuantity(agent.currentQuantity, agent.unit)}</TableCell>
                      <TableCell>{formatQuantity(agent.minimumQuantity, agent.unit)}</TableCell>
                      <TableCell>
                        <StockStatusBadge low={low} />
                      </TableCell>
                      <TableCell>{formatDate(agent.updatedAt)}</TableCell>
                      {isAdmin ? (
                        <TableCell>
                          <AgentRowActions agentId={agent.id} isAdmin={isAdmin} />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground">
                    Nenhum agente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              Página {currentPage} de {pageCount}
            </span>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" aria-disabled={currentPage <= 1}>
                <Link href={pageHref(Math.max(1, currentPage - 1), filters)}>Anterior</Link>
              </Button>
              <Button asChild variant="outline" size="sm" aria-disabled={currentPage >= pageCount}>
                <Link href={pageHref(Math.min(pageCount, currentPage + 1), filters)}>Próxima</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
