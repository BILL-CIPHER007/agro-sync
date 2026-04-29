import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

type DecimalLike = number | string | { toNumber: () => number };

export function toNumber(value: DecimalLike) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

export function formatQuantity(value: DecimalLike, unit?: string) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(toNumber(value));

  return unit ? `${formatted} ${unit}` : formatted;
}

export function isLowStock(currentQuantity: DecimalLike, minimumQuantity: DecimalLike) {
  return toNumber(currentQuantity) <= toNumber(minimumQuantity);
}

export type ActionResult = {
  ok: boolean;
  message: string;
};

export const success = (message: string): ActionResult => ({ ok: true, message });
export const failure = (message: string): ActionResult => ({ ok: false, message });
