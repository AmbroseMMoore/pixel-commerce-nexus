import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ruler } from "lucide-react";

interface SizeChartModalProps {
  headers: string[];
  rows: string[][];
  productTitle: string;
}

export const SizeChartModal = ({
  headers,
  rows,
  productTitle,
}: SizeChartModalProps) => {
  // Don't render if no size chart data
  if (!headers || headers.length === 0 || !rows || rows.length === 0) {
    return null;
  }

  // Check if there's actual content (not just empty strings)
  const hasContent = rows.some(row => row.some(cell => cell && cell.trim() !== ""));
  if (!hasContent) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ruler className="h-4 w-4" />
          Size Chart
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Size Chart - {productTitle}</DialogTitle>
          <DialogDescription>
            Reference guide for selecting the right size
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-sm font-semibold border"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-muted/30 transition-colors">
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-sm border">
                      {cell || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>💡 Tip: For best fit, compare these measurements with a similar garment you already own.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
