import { Badge } from "@/components/ui/badge";

export function StockStatusBadge({ low }: { low: boolean }) {
  return low ? <Badge variant="warning">Estoque Baixo</Badge> : <Badge variant="success">OK</Badge>;
}

export function RestockStatusBadge({
  status
}: {
  status: "PENDENTE" | "APROVADO" | "RECEBIDO" | "CANCELADO";
}) {
  const variants = {
    PENDENTE: "warning",
    APROVADO: "info",
    RECEBIDO: "success",
    CANCELADO: "muted"
  } as const;

  const labels = {
    PENDENTE: "Pendente",
    APROVADO: "Aprovado",
    RECEBIDO: "Recebido",
    CANCELADO: "Cancelado"
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

export function MovementTypeBadge({ type }: { type: "ENTRADA" | "SAIDA" }) {
  return type === "ENTRADA" ? <Badge variant="success">Entrada</Badge> : <Badge variant="outline">Saída</Badge>;
}
