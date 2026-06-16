import Link from "next/link";
import { Activity, ArrowDownToLine, ArrowUpFromLine, PackageSearch } from "lucide-react";
import { ReportActions } from "@/components/relatorios/report-actions";
import { MovementTypeBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import {
  defaultMovementReportFilters,
  movementReportSearchParams,
  movementReportWhere
} from "@/lib/reports/movements";
import { formatDate, formatDateTime, formatQuantity } from "@/lib/utils";
import {
  movementReportFilterSchema,
  type MovementReportFilter
} from "@/lib/validations/relatorios";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function reportHref(page: number, filters: MovementReportFilter) {
  const params = movementReportSearchParams({ ...filters, page });
  return `/relatorios?${params.toString()}`;
}

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const parsedFilters = movementReportFilterSchema.safeParse({
    agentId: single(searchParams.agentId),
    type: single(searchParams.type),
    startDate: single(searchParams.startDate),
    endDate: single(searchParams.endDate),
    page: single(searchParams.page)
  });

  const filters = parsedFilters.success ? parsedFilters.data : defaultMovementReportFilters;
  const where = movementReportWhere(filters);
  const pageSize = 30;

  const [agents, totalMovements, groupedMovements] = await Promise.all([
    prisma.agriculturalAgent.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        unit: true,
        supplier: true,
        shipmentNumber: true,
        expirationDate: true,
        currentQuantity: true
      }
    }),
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.groupBy({
      by: ["agentId", "type"],
      where,
      _sum: { quantity: true },
      _count: { _all: true }
    })
  ]);

  const pageCount = Math.max(1, Math.ceil(totalMovements / pageSize));
  const currentPage = Math.min(filters.page, pageCount);

  const movements = await prisma.stockMovement.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    include: {
      agent: { select: { name: true, unit: true } },
      user: { select: { name: true } }
    }
  });

  const agentsById = new Map(agents.map((agent) => [agent.id, agent]));
  const summaryByAgent = new Map<
    string,
    {
      agent: (typeof agents)[number];
      entries: number;
      consumption: number;
      movementCount: number;
    }
  >();

  let entryMovementCount = 0;
  let exitMovementCount = 0;

  for (const group of groupedMovements) {
    const agent = agentsById.get(group.agentId);
    if (!agent) continue;

    const summary = summaryByAgent.get(agent.id) ?? {
      agent,
      entries: 0,
      consumption: 0,
      movementCount: 0
    };

    const quantity = group._sum.quantity?.toNumber() ?? 0;
    summary.movementCount += group._count._all;

    if (group.type === "ENTRADA") {
      summary.entries += quantity;
      entryMovementCount += group._count._all;
    } else {
      summary.consumption += quantity;
      exitMovementCount += group._count._all;
    }

    summaryByAgent.set(agent.id, summary);
  }

  const summaries = Array.from(summaryByAgent.values()).sort((a, b) =>
    a.agent.name.localeCompare(b.agent.name, "pt-BR")
  );

  const exportParams = movementReportSearchParams({ ...filters, page: 1 }, false).toString();
  const exportHref = `/api/relatorios/movimentacoes${exportParams ? `?${exportParams}` : ""}`;

  const cards = [
    {
      label: "Movimentacoes",
      value: totalMovements,
      detail: "registros no periodo",
      icon: Activity,
      tone: "text-primary"
    },
    {
      label: "Entradas",
      value: entryMovementCount,
      detail: "registros de entrada",
      icon: ArrowDownToLine,
      tone: "text-emerald-700"
    },
    {
      label: "Saidas / consumo",
      value: exitMovementCount,
      detail: "registros de saida",
      icon: ArrowUpFromLine,
      tone: "text-amber-700"
    },
    {
      label: "Agentes movimentados",
      value: summaries.length,
      detail: "itens no relatorio",
      icon: PackageSearch,
      tone: "text-sky-700"
    }
  ];

  return (
    <div>
      <PageHeader
        title="Relatorios"
        description="Movimentacoes, entradas, consumo e rastreabilidade dos agentes agricolas."
        actions={<ReportActions exportHref={exportHref} />}
      />

      <Card className="mb-5 print:hidden">
        <CardContent className="pt-5">
          <form className="grid gap-4 lg:grid-cols-[1fr_180px_180px_180px_auto_auto]" action="/relatorios">
            <div className="space-y-2">
              <Label htmlFor="reportAgentId">Agente agricola</Label>
              <Select id="reportAgentId" name="agentId" defaultValue={filters.agentId ?? ""}>
                <option value="">Todos os agentes</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Movimentacao</Label>
              <Select id="reportType" name="type" defaultValue={filters.type}>
                <option value="ALL">Entradas e saidas</option>
                <option value="ENTRADA">Somente entradas</option>
                <option value="SAIDA">Somente consumo</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportStartDate">Data inicial</Label>
              <Input id="reportStartDate" name="startDate" type="date" defaultValue={filters.startDate ?? ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportEndDate">Data final</Label>
              <Input id="reportEndDate" name="endDate" type="date" defaultValue={filters.endDate ?? ""} />
            </div>

            <Button type="submit" variant="outline" className="self-end">
              Gerar
            </Button>
            <Button asChild type="button" variant="ghost" className="self-end">
              <Link href="/relatorios">Limpar</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <Icon className={`h-4 w-4 ${card.tone}`} aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resumo por agente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agente</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Remessa</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Entradas</TableHead>
                <TableHead>Consumo</TableHead>
                <TableHead>Saldo movimentado</TableHead>
                <TableHead>Estoque atual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.length ? (
                summaries.map((summary) => (
                  <TableRow key={summary.agent.id}>
                    <TableCell>
                      <p className="font-medium">{summary.agent.name}</p>
                      <p className="text-xs text-muted-foreground">{summary.agent.category}</p>
                    </TableCell>
                    <TableCell>{summary.agent.supplier ?? "-"}</TableCell>
                    <TableCell>{summary.agent.shipmentNumber ?? "-"}</TableCell>
                    <TableCell>{formatDate(summary.agent.expirationDate)}</TableCell>
                    <TableCell>{formatQuantity(summary.entries, summary.agent.unit)}</TableCell>
                    <TableCell>{formatQuantity(summary.consumption, summary.agent.unit)}</TableCell>
                    <TableCell>
                      {formatQuantity(summary.entries - summary.consumption, summary.agent.unit)}
                    </TableCell>
                    <TableCell>{formatQuantity(summary.agent.currentQuantity, summary.agent.unit)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nenhuma movimentacao encontrada para os filtros informados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Movimentacoes detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Responsavel</TableHead>
                <TableHead>Observacao</TableHead>
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
                    Nenhuma movimentacao encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm print:hidden">
            <span className="text-muted-foreground">
              Pagina {currentPage} de {pageCount}
            </span>
            <div className="flex gap-2">
              {currentPage > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={reportHref(currentPage - 1, filters)}>Anterior</Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" disabled>
                  Anterior
                </Button>
              )}

              {currentPage < pageCount ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={reportHref(currentPage + 1, filters)}>Proxima</Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" disabled>
                  Proxima
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
