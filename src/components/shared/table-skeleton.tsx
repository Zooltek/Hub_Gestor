import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  columnWidths?: string[];
}

export function TableSkeleton({
  rows = 5,
  columns = 6,
  columnWidths = [],
}: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <TableRow key={rIdx} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <TableCell key={cIdx} className="py-3">
              <div
                className="h-4 bg-muted/70 dark:bg-muted/40 animate-pulse rounded"
                style={{
                  width: columnWidths[cIdx] || (cIdx === 0 ? "70%" : cIdx === 1 ? "90%" : "60%"),
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
