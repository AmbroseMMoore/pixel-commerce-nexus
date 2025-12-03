import React from "react";
import { Ruler, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface SizeChartCollapsibleProps {
  headers: string[];
  rows: string[][];
  productTitle?: string;
}

export const SizeChartCollapsible: React.FC<SizeChartCollapsibleProps> = ({
  headers,
  rows,
  productTitle,
}) => {
  const safeHeaders = headers || [];
  const safeRows = rows || [];

  const hasContent =
    safeHeaders.length > 0 &&
    safeRows.length > 0 &&
    safeRows.some((row) => row.some((cell) => cell && cell.trim() !== ""));

  return (
    <div className="mb-6 border rounded-md">
      <Collapsible>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between px-4 py-3 text-sm font-medium",
            "hover:bg-muted transition-colors",
            "[&[data-state=open]>svg]:rotate-180"
          )}
        >
          <span className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            <span>Size Chart{productTitle ? ` - ${productTitle}` : ""}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 pb-4">
          {hasContent ? (
            <>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-muted">
                      {safeHeaders.map((header, index) => (
                        <th
                          key={index}
                          className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold border"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeRows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {row.map((cell, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-3 sm:px-4 py-2 sm:py-3 border"
                          >
                            {cell || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] sm:text-xs text-muted-foreground">
                Tip: For best fit, compare these measurements with a similar garment
                you already own.
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              No size chart data available for this product.
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
