import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useCartReminders } from "@/hooks/useCartReminders";
import { Clock, Gift, AlertTriangle, Bell } from "lucide-react";

const stepIcons: Record<string, React.ReactNode> = {
  reminder: <Bell className="h-4 w-4" />,
  urgency: <AlertTriangle className="h-4 w-4" />,
  discount: <Gift className="h-4 w-4" />,
  final_discount: <Gift className="h-4 w-4" />,
};

const stepColors: Record<string, string> = {
  reminder: "bg-blue-100 text-blue-800",
  urgency: "bg-orange-100 text-orange-800",
  discount: "bg-green-100 text-green-800",
  final_discount: "bg-purple-100 text-purple-800",
};

const ReminderScheduleEditor = () => {
  const { schedule, scheduleLoading, updateSchedule } = useCartReminders();

  if (scheduleLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Reminder Schedule</CardTitle>
          <CardDescription>Configure timing and content for each reminder step</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {schedule.map((step) => (
            <div key={step.id} className="p-4 rounded-lg border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {stepIcons[step.message_type]}
                  <span className="font-medium">Step {step.step_number}</span>
                  <Badge className={stepColors[step.message_type] || "bg-gray-100"}>
                    {step.message_type.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${step.id}`} className="text-sm">Active</Label>
                  <Switch
                    id={`active-${step.id}`}
                    checked={step.is_active}
                    onCheckedChange={(checked) =>
                      updateSchedule.mutate({ id: step.id, is_active: checked })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Delay (hours after abandonment)
                  </Label>
                  <Input
                    type="number"
                    defaultValue={step.delay_hours}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (val !== step.delay_hours && val > 0) {
                        updateSchedule.mutate({ id: step.id, delay_hours: val });
                      }
                    }}
                    className="mt-1"
                  />
                </div>
                {(step.message_type === "discount" || step.message_type === "final_discount") && (
                  <>
                    <div>
                      <Label className="text-xs">Discount Code</Label>
                      <Input
                        defaultValue={step.discount_code || ""}
                        onBlur={(e) => {
                          if (e.target.value !== (step.discount_code || "")) {
                            updateSchedule.mutate({ id: step.id, discount_code: e.target.value });
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Discount %</Label>
                      <Input
                        type="number"
                        defaultValue={step.discount_percentage || ""}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (val !== step.discount_percentage) {
                            updateSchedule.mutate({ id: step.id, discount_percentage: val });
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </div>

              {step.message_preview && (
                <div className="p-3 rounded bg-muted text-sm whitespace-pre-wrap">
                  {step.message_preview}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReminderScheduleEditor;
