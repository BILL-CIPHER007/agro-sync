import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { movementReportWhere } from "@/lib/reports/movements";
import { formatDate, formatDateTime, toNumber } from "@/lib/utils";
import { movementReportFilterSchema } from "@/lib/validations/relatorios";

export const runtime = "nodejs";

function csvCell(value: string | number | null | undefined) {
  let text = value === null || value === undefined ? "" : String(value);

  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response("Nao autorizado.", { status: 401 });
  }

  const parsed = movementReportFilterSchema.safeParse({
    agentId: request.nextUrl.searchParams.get("agentId") ?? undefined,
    type: request.nextUrl.searchParams.get("type") ?? undefined,
    startDate: request.nextUrl.searchParams.get("startDate") ?? undefined,
    endDate: request.nextUrl.searchParams.get("endDate") ?? undefined,
    page: 1
  });

  if (!parsed.success) {
    return new Response("Filtros invalidos.", { status: 400 });
  }

  const movements = await prisma.stockMovement.findMany({
    where: movementReportWhere(parsed.data),
    orderBy: { createdAt: "desc" },
    include: {
      agent: {
        select: {
          name: true,
          category: true,
          unit: true,
          supplier: true,
          shipmentNumber: true,
          expirationDate: true
        }
      },
      user: { select: { name: true } }
    }
  });

  const rows = [
    [
      "Data",
      "Agente",
      "Categoria",
      "Fornecedor",
      "Remessa",
      "Validade",
      "Tipo",
      "Quantidade",
      "Unidade",
      "Responsavel",
      "Observacao"
    ],
    ...movements.map((movement) => [
      formatDateTime(movement.createdAt),
      movement.agent.name,
      movement.agent.category,
      movement.agent.supplier ?? "",
      movement.agent.shipmentNumber ?? "",
      formatDate(movement.agent.expirationDate),
      movement.type,
      toNumber(movement.quantity).toLocaleString("pt-BR", { maximumFractionDigits: 2 }),
      movement.agent.unit,
      movement.user.name,
      movement.note ?? ""
    ])
  ];

  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
  const filename = `agrosync-movimentacoes-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}
