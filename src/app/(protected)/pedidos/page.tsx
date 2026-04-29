import Link from "next/link";
import { Plus } from "lucide-react";
import { RestockRequestActions } from "@/components/pedidos/restock-request-actions";
import { PageHeader } from "@/components/shared/page-header";
import { RestockStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/permissions";
import { orderFilterSchema } from "@/lib/validations/pedidos";
import { formatDate, formatQuantity } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageHref(page: number, status: string) {
  const params = new URLSearchParams();
  if (status !== "ALL") params.set("status", status);
  params.set("page", String(page));
  return `/pedidos?${params.toString()}`;
}

export default async function RestockRequestsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const filters = orderFilterSchema.parse({
    status: single(searchParams.status),
    page: single(searchParams.page)
  });

  const pageSize = 10;
  const where = filters.status === "ALL" ? {} : { status: filters.status };
  const total = await prisma.restockRequest.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(filters.page, pageCount);

  const requests = await prisma.restockRequest.findMany({
    where,
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
      <PageHeader
        title="Pedidos de Abastecimento"
        description="Solicitações, aprovação e recebimento com atualização automática do estoque."
        actions={
          <Button asChild>
            <Link href="/pedidos/novo">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Novo pedido
            </Link>
          </Button>
        }
      />

      <Card className="mb-5">
        <CardContent className="pt-5">
          <form className="grid gap-3 md:grid-cols-[220px_auto]" action="/pedidos">
            <Select name="status" defaultValue={filters.status}>
              <option value="ALL">Todos os status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="APROVADO">Aprovado</option>
              <option value="RECEBIDO">Recebido</option>
              <option value="CANCELADO">Cancelado</option>
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
                <TableHead>Agente</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Prevista</TableHead>
                <TableHead>Recebimento</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length ? (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.agent.name}</TableCell>
                    <TableCell>{formatQuantity(request.requestedQuantity, request.agent.unit)}</TableCell>
                    <TableCell>
                      <RestockStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>{formatDate(request.requestDate)}</TableCell>
                    <TableCell>{formatDate(request.expectedDate)}</TableCell>
                    <TableCell>{formatDate(request.receivedDate)}</TableCell>
                    <TableCell>{request.user.name}</TableCell>
                    <TableCell>
                      <RestockRequestActions requestId={request.id} status={request.status} role={user.role} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nenhum pedido encontrado.
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
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(Math.max(1, currentPage - 1), filters.status)}>Anterior</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(Math.min(pageCount, currentPage + 1), filters.status)}>Próxima</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
