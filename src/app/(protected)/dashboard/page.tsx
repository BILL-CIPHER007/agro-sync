import Link from "next/link";
import { AlertTriangle, ClipboardList, PackageSearch, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { RestockStatusBadge, StockStatusBadge } from "@/components/shared/status-badge";
import { prisma } from "@/lib/prisma";
import { formatDate, formatQuantity, isLowStock } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [agents, stockCounters, pendingRequests, latestRequests, totalAgents] = await Promise.all([
    prisma.agriculturalAgent.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8
    }),
    prisma.agriculturalAgent.findMany({
      select: {
        currentQuantity: true,
        minimumQuantity: true
      }
    }),
    prisma.restockRequest.count({ where: { status: "PENDENTE" } }),
    prisma.restockRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        agent: { select: { name: true, unit: true } },
        user: { select: { name: true } }
      }
    }),
    prisma.agriculturalAgent.count()
  ]);

  const lowStockItems = stockCounters.filter((agent) => isLowStock(agent.currentQuantity, agent.minimumQuantity)).length;

  const cards = [
    {
      label: "Agentes cadastrados",
      value: totalAgents,
      icon: PackageSearch,
      tone: "text-primary"
    },
    {
      label: "Itens com estoque baixo",
      value: lowStockItems,
      icon: AlertTriangle,
      tone: "text-amber-600"
    },
    {
      label: "Pedidos pendentes",
      value: pendingRequests,
      icon: ClipboardList,
      tone: "text-sky-700"
    },
    {
      label: "Pedidos recentes",
      value: latestRequests.length,
      icon: TrendingUp,
      tone: "text-emerald-700"
    }
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral de estoque, alertas e pedidos de abastecimento."
        actions={
          <Button asChild>
            <Link href="/pedidos/novo">Novo pedido</Link>
          </Button>
        }
      />

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
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Estoque atual</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agente</TableHead>
                  <TableHead>Categoria</TableHead>
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
                        <TableCell>{agent.category}</TableCell>
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
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum agente cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestRequests.length ? (
                latestRequests.map((request) => (
                  <div key={request.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{request.agent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatQuantity(request.requestedQuantity, request.agent.unit)} por {request.user.name}
                        </p>
                      </div>
                      <RestockStatusBadge status={request.status} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Pedido em {formatDate(request.requestDate)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum pedido registrado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
