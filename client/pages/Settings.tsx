import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  Bell,
  MessageSquare,
  Store,
  User,
  Shield,
  Smartphone,
  Mail,
  Save,
  TestTube,
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/context/CurrencyContext";

interface NotificationSettings {
  lowStock: boolean;
  outOfStock: boolean;
  newOrders: boolean;
  orderStatusUpdates: boolean;
  paymentUpdates: boolean;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  emailEnabled: boolean;
  emailAddress: string;
  lowStockThreshold: number;
}

interface BusinessSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxRate: number;
  defaultMinStock: number;
}

export default function Settings() {
  const { setCurrency } = useCurrency();
  const [notifications, setNotifications] = useState<NotificationSettings>({
    lowStock: true,
    outOfStock: true,
    newOrders: true,
    orderStatusUpdates: false,
    paymentUpdates: false,
    whatsappEnabled: false,
    whatsappNumber: "",
    emailEnabled: true,
    emailAddress: "",
    lowStockThreshold: 5,
  });

  const [business, setBusiness] = useState<BusinessSettings>({
    businessName: "T-Shirt Store",
    address: "",
    phone: "",
    email: "",
    currency: "USD",
    taxRate: 0,
    defaultMinStock: 5,
  });

  const [loading, setLoading] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data.notifications || notifications);
        setBusiness(data.data.business || business);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifications,
          business,
        }),
      });

      if (response.ok) {
        // Show success message
        console.log("Settings saved successfully");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const testWhatsAppConnection = async () => {
    if (!notifications.whatsappNumber) {
      alert("Please enter your WhatsApp number first");
      return;
    }

    try {
      setTestingWhatsApp(true);
      const response = await fetch("/api/notifications/test-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: notifications.whatsappNumber,
          message:
            "🧪 Test message from T-Shirt Manager!\n\nIf you receive this, WhatsApp notifications are working correctly.",
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Test message sent! Check your WhatsApp.");
      } else {
        alert(
          "Failed to send test message. Please check your number and try again.",
        );
      }
    } catch (error) {
      console.error("Error testing WhatsApp:", error);
      alert("Error testing WhatsApp connection");
    } finally {
      setTestingWhatsApp(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format for Indian phone numbers
    if (digits.startsWith("91") && digits.length === 12) {
      // +91 XXXXX XXXXX format for Indian numbers
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    } else if (digits.length === 10 && !digits.startsWith("91")) {
      // Add +91 prefix for 10-digit Indian numbers
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    } else if (digits.startsWith("1") && digits.length === 11) {
      // US format for backwards compatibility
      return `+1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    return value;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600">
              Configure your application preferences and notifications
            </p>
          </div>
          <Button onClick={saveSettings} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Alert Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="lowStock">Low Stock Alerts</Label>
                        <p className="text-sm text-slate-600">
                          Get notified when inventory is running low
                        </p>
                      </div>
                      <Switch
                        id="lowStock"
                        checked={notifications.lowStock}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            lowStock: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="outOfStock">Out of Stock Alerts</Label>
                        <p className="text-sm text-slate-600">
                          Get notified when items are completely out of stock
                        </p>
                      </div>
                      <Switch
                        id="outOfStock"
                        checked={notifications.outOfStock}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            outOfStock: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newOrders">New Order Alerts</Label>
                        <p className="text-sm text-slate-600">
                          Get notified when new orders are placed
                        </p>
                      </div>
                      <Switch
                        id="newOrders"
                        checked={notifications.newOrders}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            newOrders: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="orderStatusUpdates">
                          Order Status Updates
                        </Label>
                        <p className="text-sm text-slate-600">
                          Get notified when order status changes
                        </p>
                      </div>
                      <Switch
                        id="orderStatusUpdates"
                        checked={notifications.orderStatusUpdates}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            orderStatusUpdates: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Low Stock Threshold</h3>
                  <div className="w-full max-w-xs">
                    <Label htmlFor="threshold">
                      Alert when stock falls below
                    </Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="1"
                      value={notifications.lowStockThreshold}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          lowStockThreshold: parseInt(e.target.value) || 5,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  WhatsApp Notifications
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700"
                  >
                    Premium Feature
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsappEnabled">
                      Enable WhatsApp Notifications
                    </Label>
                    <p className="text-sm text-slate-600">
                      Receive instant alerts on your WhatsApp
                    </p>
                  </div>
                  <Switch
                    id="whatsappEnabled"
                    checked={notifications.whatsappEnabled}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        whatsappEnabled: checked,
                      })
                    }
                  />
                </div>

                {notifications.whatsappEnabled && (
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                      <div className="flex gap-2">
                        <Input
                          id="whatsappNumber"
                          placeholder="+91 98765 43210"
                          value={notifications.whatsappNumber}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            setNotifications({
                              ...notifications,
                              whatsappNumber: formatted,
                            });
                          }}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={testWhatsAppConnection}
                          disabled={
                            testingWhatsApp || !notifications.whatsappNumber
                          }
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          {testingWhatsApp ? "Sending..." : "Test"}
                        </Button>
                      </div>
                      <p className="text-sm text-slate-600">
                        Enter your WhatsApp number with country code (e.g., +91
                        for India)
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded border">
                      <h4 className="font-medium text-green-800 mb-2">
                        Example notifications you'll receive:
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-green-100 rounded">
                          <p className="font-medium">📦 Low Stock Alert</p>
                          <p>
                            "Classic Cotton Tee (M, Black)" is running low! Only
                            3 units left.
                          </p>
                        </div>
                        <div className="p-2 bg-green-100 rounded">
                          <p className="font-medium">🛍️ New Order</p>
                          <p>
                            New order #1234 received from John Smith - $49.98
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailEnabled">
                      Enable Email Notifications
                    </Label>
                    <p className="text-sm text-slate-600">
                      Receive alerts via email
                    </p>
                  </div>
                  <Switch
                    id="emailEnabled"
                    checked={notifications.emailEnabled}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        emailEnabled: checked,
                      })
                    }
                  />
                </div>

                {notifications.emailEnabled && (
                  <div>
                    <Label htmlFor="emailAddress">Email Address</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      placeholder="your@email.com"
                      value={notifications.emailAddress}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          emailAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={business.businessName}
                    onChange={(e) =>
                      setBusiness({ ...business, businessName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessAddress">Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={business.address}
                    onChange={(e) =>
                      setBusiness({ ...business, address: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessPhone">Phone</Label>
                    <Input
                      id="businessPhone"
                      value={business.phone}
                      onChange={(e) =>
                        setBusiness({ ...business, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessEmail">Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={business.email}
                      onChange={(e) =>
                        setBusiness({ ...business, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={business.currency}
                      onValueChange={(value) => {
                        setBusiness({ ...business, currency: value });
                        setCurrency(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      value={business.taxRate}
                      onChange={(e) =>
                        setBusiness({
                          ...business,
                          taxRate: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Inventory Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultMinStock">
                    Default Minimum Stock Level
                  </Label>
                  <Input
                    id="defaultMinStock"
                    type="number"
                    min="1"
                    value={business.defaultMinStock}
                    onChange={(e) =>
                      setBusiness({
                        ...business,
                        defaultMinStock: parseInt(e.target.value) || 5,
                      })
                    }
                  />
                  <p className="text-sm text-slate-600 mt-1">
                    This will be the default minimum stock level for new
                    products
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="font-medium">Account Type: Administrator</p>
                    <p className="text-sm text-slate-600">
                      Full access to all features
                    </p>
                  </div>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
