import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingCart, Send, TrendingUp, DollarSign, Search, 
  Pause, Play, Square, Eye, MessageCircle, Settings2 
} from "lucide-react";
import { useCartReminders } from "@/hooks/useCartReminders";
import { format } from "date-fns";
import CartReminderDetailsModal from "@/components/admin/CartReminderDetailsModal";
import ReminderScheduleEditor from "@/components/admin/ReminderScheduleEditor";

const AdminCartReminders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stepFilter, setStepFilter] = useState("all");
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(null);

  const {
    tracking, trackingLoading,
    stats, statsLoading,
    settings, settingsLoading,
    schedule,
    togglePause, stopReminder, updateSettings,
  } = useCartReminders({
    status: statusFilter !== "all" ? statusFilter : undefined,
    step: stepFilter !== "all" ? Number(stepFilter) : undefined,
    search: search || undefined,
  });

  const getStatusBadge = (item: any) => {
    if (item.is_converted) return <Badge className="bg-green-100 text-green-800">Converted</Badge>;
    if (item.is_stopped) return <Badge variant="destructive">Stopped</Badge>;
    if (item.is_paused) return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
    return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cart Reminders</h1>
            <p className="text-muted-foreground">WhatsApp abandoned cart recovery system</p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="system-toggle" className="text-sm">System</Label>
            <Switch
              id="system-toggle"
              checked={settings?.is_enabled || false}
              onCheckedChange={(checked) => updateSettings.mutate({ is_enabled: checked })}
              disabled={settingsLoading}
            />
            <span className="text-sm font-medium">
              {settings?.is_enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Abandoned Carts</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.abandonedCarts || 0}</div>
              <p className="text-xs text-muted-foreground">Currently in reminder flow</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.remindersSentToday || 0}</div>
              <p className="text-xs text-muted-foreground">WhatsApp messages sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
              <p className="text-xs text-muted-foreground">{stats?.totalConverted || 0} of {stats?.totalTracked || 0} converted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recovered Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(stats?.recoveredRevenue || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From converted carts</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tracking" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tracking">Abandoned Carts</TabsTrigger>
            <TabsTrigger value="schedule">Reminder Schedule</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stepFilter} onValueChange={setStepFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Step" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Steps</SelectItem>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <SelectItem key={s} value={String(s)}>Step {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Cart Value</TableHead>
                      <TableHead>Step</TableHead>
                      <TableHead>Last Sent</TableHead>
                      <TableHead>Next Reminder</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trackingLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : tracking.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No abandoned cart records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      tracking.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.customers?.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{item.customers?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.phone_number}</TableCell>
                          <TableCell>₹{Number(item.cart_value).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.reminder_step}/5</span>
                              <Progress value={(item.reminder_step / 5) * 100} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.last_reminder_sent_at
                              ? format(new Date(item.last_reminder_sent_at), "MMM d, HH:mm")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.next_reminder_at && !item.is_converted && !item.is_stopped
                              ? format(new Date(item.next_reminder_at), "MMM d, HH:mm")
                              : "—"}
                          </TableCell>
                          <TableCell>{getStatusBadge(item)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost" size="icon"
                                onClick={() => setSelectedTrackingId(item.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!item.is_converted && !item.is_stopped && (
                                <>
                                  <Button
                                    variant="ghost" size="icon"
                                    onClick={() => togglePause.mutate({ id: item.id, is_paused: !item.is_paused })}
                                  >
                                    {item.is_paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                  </Button>
                                  <Button
                                    variant="ghost" size="icon"
                                    onClick={() => stopReminder.mutate(item.id)}
                                  >
                                    <Square className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <ReminderScheduleEditor />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Integration
                </CardTitle>
                <CardDescription>
                  Configure your Meta WhatsApp Business API connection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Connection Status</p>
                    <p className="text-sm text-muted-foreground">
                      {settings?.whatsapp_phone_number ? "Connected" : "Not configured"}
                    </p>
                  </div>
                  <Badge variant={settings?.whatsapp_phone_number ? "default" : "secondary"}>
                    {settings?.whatsapp_phone_number ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
                <div>
                  <Label>WhatsApp Business Phone Number</Label>
                  <Input
                    placeholder="+91XXXXXXXXXX"
                    defaultValue={settings?.whatsapp_phone_number || ""}
                    onBlur={(e) => {
                      if (e.target.value !== (settings?.whatsapp_phone_number || "")) {
                        updateSettings.mutate({ whatsapp_phone_number: e.target.value });
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The phone number registered with Meta WhatsApp Business API
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-medium mb-2">Setup Instructions</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-4">
                    <li>Create a Meta Business Account at business.facebook.com</li>
                    <li>Set up WhatsApp Business API and add a phone number</li>
                    <li>Create message templates (cart_reminder, cart_urgency, cart_discount)</li>
                    <li>Get your Access Token and Phone Number ID</li>
                    <li>Add WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID as Supabase secrets</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedTrackingId && (
        <CartReminderDetailsModal
          trackingId={selectedTrackingId}
          onClose={() => setSelectedTrackingId(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminCartReminders;
