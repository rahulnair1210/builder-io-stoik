import { RequestHandler } from "express";
import { ApiResponse } from "@shared/types";

// Mock settings data
let settingsData = {
  notifications: {
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
  },
  business: {
    businessName: "T-Shirt Store",
    address: "",
    phone: "",
    email: "",
    currency: "USD",
    taxRate: 0,
    defaultMinStock: 5,
  },
};

export const getSettings: RequestHandler = (req, res) => {
  try {
    const response: ApiResponse<typeof settingsData> = {
      data: settingsData,
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to fetch settings",
    });
  }
};

export const updateSettings: RequestHandler = (req, res) => {
  try {
    const { notifications, business } = req.body;

    if (notifications) {
      settingsData.notifications = {
        ...settingsData.notifications,
        ...notifications,
      };
    }

    if (business) {
      settingsData.business = { ...settingsData.business, ...business };
    }

    const response: ApiResponse<typeof settingsData> = {
      data: settingsData,
      success: true,
      message: "Settings updated successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      data: null,
      success: false,
      message: "Failed to update settings",
    });
  }
};

export const testWhatsAppNotification: RequestHandler = (req, res) => {
  try {
    const { number, message } = req.body;

    // In a real implementation, you would integrate with WhatsApp Business API
    // For now, we'll simulate a successful test
    console.log(`Would send WhatsApp to ${number}: ${message}`);

    // Simulate API call delay
    setTimeout(() => {
      const response: ApiResponse<{ sent: boolean }> = {
        data: { sent: true },
        success: true,
        message: "WhatsApp test message sent successfully",
      };

      res.json(response);
    }, 1000);
  } catch (error) {
    console.error("Error testing WhatsApp:", error);
    res.status(500).json({
      data: { sent: false },
      success: false,
      message: "Failed to send WhatsApp test message",
    });
  }
};

export const sendLowStockNotification: RequestHandler = (req, res) => {
  try {
    const { products } = req.body;

    // Check if WhatsApp notifications are enabled
    if (
      settingsData.notifications.whatsappEnabled &&
      settingsData.notifications.whatsappNumber
    ) {
      // Format message for low stock products
      let message = "🚨 LOW STOCK ALERT 🚨\n\n";
      products.forEach((product: any) => {
        message += `📦 ${product.name} (${product.size}, ${product.color})\n`;
        message += `   Only ${product.stockLevel} left (Min: ${product.minStockLevel})\n\n`;
      });
      message += "Please restock these items soon!";

      console.log(
        `Would send WhatsApp to ${settingsData.notifications.whatsappNumber}: ${message}`,
      );
    }

    const response: ApiResponse<{ sent: boolean }> = {
      data: { sent: true },
      success: true,
      message: "Low stock notifications sent",
    };

    res.json(response);
  } catch (error) {
    console.error("Error sending low stock notification:", error);
    res.status(500).json({
      data: { sent: false },
      success: false,
      message: "Failed to send low stock notification",
    });
  }
};
