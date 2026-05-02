import { Prisma } from "@prisma/client";
import Link from "next/link";
import { StockMovementForm } from "@/components/estoque/stock-movement-form";
import { PageHeader } from "@/components/shared/page-header";
import { MovementTypeBadge, StockStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatQuantity, isLowStock, toNumber } from "@/lib/utils";
import { stockHistoryFilterSchema, type StockHistoryFilter } from "@/lib/validations/estoque";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const defaultFilters: StockHistoryFilter = {
  agentId: undefined,
  type: "ALL",
  startDate: undefined,
  endDate: undefined,
  page: 1
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function dateInputValue(value: Date | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function dateInputDay(value: Date, hours: number, minutes: number, seconds: number, milliseconds: number) {
  return new Date(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
    hours,
    minutes,
    seconds,
    milliseconds
  );
}

function startOfDateInputDay(value: Date) {
  return dateInputDay(value, 0, 0, 0, 0);
}

function endOfDateInputDay(value: Date) {
  return dateInputDay(value, 23, 59, 59, 999);
}

function historyHref(page: number, filters: StockHistoryFilter) {
  const params = new URLSearchParams();
  if (filters.agentId) params.set("agentId", filters.agentId);
  if (filters.type !== "ALL") params.set("type", filters.type);
  if (filters.startDate) params.set("startDate", dateInputValue(filters.startDate));
  if (filters.endDate) params.set("endDate", dateInputValue(filters.endDate));
  params.set("page", String(page));
  return `/estoque?${params.toString()}`;
}

export default async function StockPage({ searchParams }: { searchParams: SearchParams }) {
  const parsedFilters = stockHistoryFilterSchema.safeParse({
    agentId: single(searchParams.agentId),
    type: single(searchParams.type),
    startDate: single(searchParams.startDate),
    endDate: single(searchParams.endDate),
    page: single(searchParams.page)
  });

  const filters = parsedFilters.success ? parsedFilters.data : defaultFilters;

  const movementWhere: Prisma.StockMovementWhereInput = {
    ...(filters.agentId ? { agentId: filters.agentId } : {}),
    ...(filters.type !== "ALL" ? { type: filters.type } : {}),
    ...(filters.startDate || filters.endDate
      ? {
          createdAt: {
            ...(filters.startDate ? { gte: startOfDateInputDay(filters.startDate) } : {}),
            ...(filters.endDate ? { lte: endOfDateInputDay(filters.endDate) } : {})
          }
        }
      : {})
  };

  const pageSize = 20;

  const [agents, totalMovements] = await Promise.all([
    prisma.agriculturalAgent.findMany({
      orderBy: { name: "asc" }
    }),
    prisma.stockMovement.count({
      where: movementWhere
    })
  ]);

  const pageCount = Math.max(1, Math.ceil(totalMovements / pageSize));
  const currentPage = Math.min(filters.page, pageCount);

  const movements = await prisma.stockMovement.findMany({
    where: movementWhere,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    include: {
      agent: { select: { name: true, unit: true } },
      user: { select: { name: true } }
    }
  });

  return (
    <div>
      <PageHeader title="Controle de Estoque" description="Entradas, saídas e histórico de movimentações." />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <StockMovementForm
          agents={agents.map((agent) => ({
            id: agent.id,
            name: agent.name,
            unit: agent.unit,
            currentQuantity: toNumber(agent.currentQuantity)
          }))}
        />

        <Card>
          <CardHeader>
            <CardTitle>Saldo atual</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agente</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.length ? (
                  agents.map((agent) => {
                    const low = isLowStock(agent.currentQuantity, agent.minimumQuantity);

                    return (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell>{formatQuantity(agent.currentQuantity, agent.unit)}</TableCell>
                        <TableCell>{formatQuantity(agent.minimumQuantity, agent.unit)}</TableCell>
                        <TableCell>
                          <StockStatusBadge low={low} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum agente cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico de movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="mb-5 grid gap-3 lg:grid-cols-[1fr_160px_160px_160px_auto_auto]" action="/estoque">
            <Select name="agentId" defaultValue={filters.agentId ?? ""}>
              <option value="">Todos os agentes</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </Select>

            <Select name="type" defaultValue={filters.type}>
              <option value="ALL">Todos os tipos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </Select>

            <Input name="startDate" type="date" defaultValue={dateInputValue(filters.startDate)} />
            <Input name="endDate" type="date" defaultValue={dateInputValue(filters.endDate)} />

            <Button type="submit" variant="outline">
              Filtrar
            </Button>
            <Button asChild type="button" variant="ghost">
              <Link href="/estoque">Limpar</Link>
            </Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length ? (
                movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{formatDateTime(movement.createdAt)}</TableCell>
                    <TableCell className="font-medium">{movement.agent.name}</TableCell>
                    <TableCell>
                      <MovementTypeBadge type={movement.type} />
                    </TableCell>
                    <TableCell>{formatQuantity(movement.quantity, movement.agent.unit)}</TableCell>
                    <TableCell>{movement.user.name}</TableCell>
                    <TableCell className="max-w-sm truncate">{movement.note ?? "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhuma movimentação registrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">
              {totalMovements} movimentação{totalMovements === 1 ? "" : "es"} encontrada
              {totalMovements === 1 ? "" : "s"} - página {currentPage} de {pageCount}
            </span>
            <div className="flex gap-2">
              {currentPage > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={historyHref(currentPage - 1, filters)}>Anterior</Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" disabled>
                  Anterior
                </Button>
              )}

              {currentPage < pageCount ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={historyHref(currentPage + 1, filters)}>Próxima</Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" disabled>
                  Próxima
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
