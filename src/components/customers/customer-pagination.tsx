"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "@/hooks/use-translations";

interface CustomerPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function CustomerPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: CustomerPaginationProps) {
  const t = useT("customers");
  const tc = useT("common");

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {t("totalCount", { total })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          {tc("previous")}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("pageOf", { page, totalPages: totalPages || 1 })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          {tc("next")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
