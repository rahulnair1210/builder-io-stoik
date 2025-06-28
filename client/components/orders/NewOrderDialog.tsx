import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BulkOrderForm } from "@/components/customers/BulkOrderForm";
import { Customer, Order } from "@shared/types";

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

export function NewOrderDialog({
  open,
  onOpenChange,
  onOrderCreated,
}: NewOrderDialogProps) {
  return (
    <BulkOrderForm
      open={open}
      onOpenChange={onOpenChange}
      customer={null}
      onSubmit={async (orderData) => {
        try {
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
          });
          const result = await response.json();
          if (result.success) {
            // Add success notification
            const customerName =
              customers.find((c) => c.id === selectedCustomer)?.name ||
              "Unknown Customer";
            const orderTotal = orderItems.reduce(
              (sum, item) => sum + item.quantity * item.price,
              0,
            );
            window.dispatchEvent(
              new CustomEvent("addNotification", {
                detail: {
                  type: "new_order",
                  message: `New order #${result.data.id} from ${customerName} - $${orderTotal.toFixed(2)}`,
                },
              }),
            );

            onOrderCreated();
            onOpenChange(false);
          } else {
            alert("Failed to create order. Please try again.");
          }
        } catch (error) {
          console.error("Error creating order:", error);
        }
      }}
    />
  );
}
