"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportActions({ exportHref }: { exportHref: string }) {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button asChild variant="outline">
        <a href={exportHref}>
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Exportar CSV
        </a>
      </Button>
      <Button type="button" variant="outline" onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
        Imprimir / PDF
      </Button>
    </div>
  );
}
