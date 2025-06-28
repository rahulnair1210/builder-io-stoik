import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  User,
  Calendar,
} from "lucide-react";
import { Order } from "@shared/types";

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onEdit: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
}

export function OrderCard({
  order,
  onViewDetails,
  onEdit,
  onUpdateStatus,
}: OrderCardProps) {
  const { formatCurrency } = useCurrency();
  const getStatusBadge = (status: Order["status"]) => {
    const variants = {
      pending: {
        variant: "secondary" as const,
        className: "bg-warning/20 text-warning",
        icon: Clock,
      },
      processing: {
        variant: "default" as const,
        className: "bg-primary/20 text-primary",
        icon: Package,
      },
      shipped: {
        variant: "outline" as const,
        className: "bg-blue-100 text-blue-700",
        icon: Truck,
      },
      delivered: {
        variant: "secondary" as const,
        className: "bg-accent/20 text-accent",
        icon: CheckCircle,
      },
      cancelled: {
        variant: "destructive" as const,
        className: "bg-destructive/20 text-destructive",
        icon: XCircle,
      },
    };

    const { variant, className, icon: Icon } = variants[status];

    return (
      <Badge
        variant={variant}
        className={`${className} flex items-center gap-1`}
      >
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
              Order #{order.id}
            </h3>
            <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
              <User className="h-3 w-3" />
              <span>{order.customer?.name}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(order)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(order)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </DropdownMenuItem>
              {order.status === "pending" && (
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(order.id, "processing")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Mark Processing
                </DropdownMenuItem>
              )}
              {order.status === "processing" && (
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(order.id, "shipped")}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Mark Shipped
                </DropdownMenuItem>
              )}
              {order.status === "shipped" && (
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(order.id, "delivered")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Delivered
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status and Items */}
        <div className="flex gap-2 mb-4">
          {getStatusBadge(order.status)}
          <Badge variant="outline">{order.items.length} items</Badge>
        </div>

        {/* Order Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Order Date:</span>
            <span className="font-medium">{formatDate(order.orderDate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Payment:</span>
            <span className="font-medium">
              {order.paymentDate ? (
                <span className="text-accent">
                  {formatDate(order.paymentDate)}
                </span>
              ) : (
                <span className="text-slate-400">Pending</span>
              )}
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-2 mb-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total:</span>
            <span className="font-medium">
              {formatCurrency(order.totalSelling)}
            </span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="text-slate-600">Profit:</span>
            <span className="font-medium text-accent">
              +{formatCurrency(order.profit)}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>{order.customer?.email}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span>{order.customer?.phone}</span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Payment Status:</span>
            <Badge
              variant={order.paymentStatus === "paid" ? "secondary" : "outline"}
              className={
                order.paymentStatus === "paid" ? "bg-accent/20 text-accent" : ""
              }
            >
              {order.paymentStatus}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
