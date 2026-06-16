import { Prisma } from "@prisma/client";
import type { MovementReportFilter } from "@/lib/validations/relatorios";

export const defaultMovementReportFilters: MovementReportFilter = {
  agentId: undefined,
  type: "ALL",
  startDate: undefined,
  endDate: undefined,
  page: 1
};

function reportStartDate(value: string) {
  return new Date(`${value}T00:00:00.000-03:00`);
}

function reportEndDate(value: string) {
  return new Date(`${value}T23:59:59.999-03:00`);
}

export function movementReportWhere(filters: MovementReportFilter): Prisma.StockMovementWhereInput {
  return {
    ...(filters.agentId ? { agentId: filters.agentId } : {}),
    ...(filters.type !== "ALL" ? { type: filters.type } : {}),
    ...(filters.startDate || filters.endDate
      ? {
          createdAt: {
            ...(filters.startDate ? { gte: reportStartDate(filters.startDate) } : {}),
            ...(filters.endDate ? { lte: reportEndDate(filters.endDate) } : {})
          }
        }
      : {})
  };
}

export function movementReportSearchParams(filters: MovementReportFilter, includePage = true) {
  const params = new URLSearchParams();

  if (filters.agentId) params.set("agentId", filters.agentId);
  if (filters.type !== "ALL") params.set("type", filters.type);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (includePage) params.set("page", String(filters.page));

  return params;
}
