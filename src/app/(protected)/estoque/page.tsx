import { StockMovementForm } from "@/components/estoque/stock-movement-form";
import { PageHeader } from "@/components/shared/page-header";
import { MovementTypeBadge, StockStatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatQuantity, isLowStock, toNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const [agents, movements] = await Promise.all([
    prisma.agriculturalAgent.findMany({
      orderBy: { name: "asc" }
    }),
    prisma.stockMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        agent: { select: { name: true, unit: true } },
        user: { select: { name: true } }
      }
    })
  ]);

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
        </CardContent>
      </Card>
    </div>
  );
}
