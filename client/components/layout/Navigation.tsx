import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Camera,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  Shirt,
} from "lucide-react";

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badges, setBadges] = useState({
    orders: 0,
    inventory: 0,
    customers: 0,
  });
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notifications");
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [
      {
        id: 1,
        type: "low_stock",
        message: "5 products are running low on stock",
        read: false,
      },
      {
        id: 2,
        type: "new_order",
        message: "Order #1234 has been placed",
        read: false,
      },
    ];
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Persist notifications to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  // Function to add new notifications
  const addNotification = (type: string, message: string) => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Listen for global notification events
  useEffect(() => {
    const handleNotification = (event: any) => {
      addNotification(event.detail.type, event.detail.message);
    };

    window.addEventListener("addNotification", handleNotification);
    return () =>
      window.removeEventListener("addNotification", handleNotification);
  }, []);

  // Dynamic navigation items with real-time badges
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      badge: null,
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: Package,
      badge: badges.inventory > 0 ? badges.inventory : null,
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingCart,
      badge: badges.orders > 0 ? badges.orders : null,
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
      badge: null,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  // Fetch badge counts on component mount and periodically
  useEffect(() => {
    const fetchBadgeCounts = async () => {
      try {
        // Fetch non-delivered orders count (pending, processing, shipped)
        const ordersResponse = await fetch("/api/orders");
        let ordersCount = 0;
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          // Count orders that are not delivered or cancelled
          ordersCount =
            ordersData.data?.filter(
              (order: any) =>
                order.status !== "delivered" && order.status !== "cancelled",
            ).length || 0;
        }

        // Fetch low stock items count
        const inventoryResponse = await fetch(
          "/api/inventory?stockStatus=low_stock",
        );
        let inventoryCount = 0;
        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json();
          inventoryCount = inventoryData.data?.length || 0;
        }

        // Get total customers count (simplified)
        let customersCount = 0;
        try {
          const customersResponse = await fetch("/api/customers");
          if (customersResponse.ok) {
            const customersData = await customersResponse.json();
            customersCount = customersData.data?.length || 0;
          }
        } catch (customerError) {
          // Fallback: just set customers count to 0 if endpoint fails
          console.warn("Could not fetch customers:", customerError);
          customersCount = 0;
        }

        setBadges({
          orders: ordersCount,
          inventory: inventoryCount,
          customers: customersCount,
        });
      } catch (error) {
        console.error("Error fetching badge counts:", error);
        // Set default values on error
        setBadges({
          orders: 0,
          inventory: 0,
          customers: 0,
        });
      }
    };

    fetchBadgeCounts();

    // Refresh every 60 seconds (increased from 30 to reduce frequency)
    const interval = setInterval(fetchBadgeCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard" && location.pathname === "/") return true;
    return location.pathname === href;
  };

  const NavItems = ({
    className = "",
    onItemClick,
  }: {
    className?: string;
    onItemClick?: () => void;
  }) => (
    <nav className={`flex gap-1 ${className}`}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onItemClick}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-1 h-5 text-xs">
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Shirt className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1
              className="text-lg font-bold text-slate-900"
              style={{ font: "700 18px/28px 'Jacques Francois', serif" }}
            >
              Stoik
            </h1>
            <p className="text-xs text-slate-600 -mt-1">Inventory System</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <NavItems />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-destructive">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-slate-600">
                    You have {unreadCount} new alerts
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNotifications(
                        notifications.map((n) => ({ ...n, read: true })),
                      );
                    }}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        notification.read
                          ? "bg-slate-50 border-slate-200"
                          : notification.type === "low_stock"
                            ? "bg-warning/10 border-warning/20"
                            : "bg-accent/10 border-accent/20"
                      }`}
                      onClick={() => {
                        setNotifications(
                          notifications.map((n) =>
                            n.id === notification.id ? { ...n, read: true } : n,
                          ),
                        );
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${notification.read ? "text-slate-600" : ""}`}
                          >
                            {notification.type === "low_stock"
                              ? "Low Stock Alert"
                              : "New Order"}
                          </p>
                          <p className="text-xs text-slate-600">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  Admin
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                    <Shirt className="h-5 w-5 text-primary-foreground" />
                  </div>
                  T-Shirt Manager
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <NavItems
                  className="flex-col space-y-2"
                  onItemClick={() => setMobileMenuOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
