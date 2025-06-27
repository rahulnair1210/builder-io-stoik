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
      badge: badges.customers > 0 ? badges.customers : null,
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
        // Fetch pending orders count
        const ordersResponse = await fetch("/api/orders?status=pending");
        let ordersCount = 0;
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          ordersCount = ordersData.data?.length || 0;
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

        // Fetch customers with pending deliveries (with fallback)
        let customersCount = 0;
        try {
          const customersResponse = await fetch(
            "/api/customers/pending-deliveries",
          );
          if (customersResponse.ok) {
            const customersData = await customersResponse.json();
            customersCount = customersData.data?.length || 0;
          }
        } catch (customerError) {
          // Fallback: just set customers count to 0 if endpoint fails
          console.warn(
            "Could not fetch customer pending deliveries:",
            customerError,
          );
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

    // Refresh every 30 seconds
    const interval = setInterval(fetchBadgeCounts, 30000);
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
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-destructive">
                  2
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b">
                <h4 className="font-medium">Notifications</h4>
                <p className="text-sm text-slate-600">You have 2 new alerts</p>
              </div>
              <div className="p-2 space-y-2">
                <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-sm font-medium">Low Stock Alert</p>
                  <p className="text-xs text-slate-600">
                    5 products are running low on stock
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm font-medium">New Order</p>
                  <p className="text-xs text-slate-600">
                    Order #1234 has been placed
                  </p>
                </div>
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
