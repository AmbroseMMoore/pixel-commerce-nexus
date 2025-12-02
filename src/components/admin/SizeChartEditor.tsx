import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SizeChartEditorProps {
  headers: string[];
  rows: string[][];
  onHeadersChange: (headers: string[]) => void;
  onRowsChange: (rows: string[][]) => void;
}

export const SizeChartEditor = ({
  headers,
  rows,
  onHeadersChange,
  onRowsChange,
}: SizeChartEditorProps) => {
  const addColumn = () => {
    onHeadersChange([...headers, `Column ${headers.length + 1}`]);
    onRowsChange(rows.map(row => [...row, ""]));
  };

  const removeColumn = (index: number) => {
    if (headers.length <= 1) return; // Keep at least one column
    onHeadersChange(headers.filter((_, i) => i !== index));
    onRowsChange(rows.map(row => row.filter((_, i) => i !== index)));
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    onHeadersChange(newHeaders);
  };

  const addRow = () => {
    onRowsChange([...rows, Array(headers.length).fill("")]);
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length <= 1) return; // Keep at least one row
    onRowsChange(rows.filter((_, i) => i !== rowIndex));
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    onRowsChange(newRows);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Size Chart Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Headers */}
            <div className="flex items-center gap-2 flex-wrap">
              {headers.map((header, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Input
                    value={header}
                    onChange={(e) => updateHeader(index, e.target.value)}
                    placeholder={`Column ${index + 1}`}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeColumn(index)}
                    disabled={headers.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addColumn}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Column
              </Button>
            </div>

            {/* Rows */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      {headers.map((header, index) => (
                        <th key={index} className="px-4 py-2 text-left text-sm font-medium">
                          {header}
                        </th>
                      ))}
                      <th className="px-4 py-2 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t">
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="px-4 py-2">
                            <Input
                              value={cell}
                              onChange={(e) =>
                                updateCell(rowIndex, colIndex, e.target.value)
                              }
                              placeholder="Enter value"
                              className="w-full min-w-[120px]"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(rowIndex)}
                            disabled={rows.length <= 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addRow}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {headers.length > 0 && rows.length > 0 && rows[0][0] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-2 text-left text-sm font-semibold border"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-muted/50">
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="px-4 py-2 text-sm border">
                          {cell || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
