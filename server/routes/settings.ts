import { RequestHandler } from "express";
import { ApiResponse } from "@shared/types";
import { settingsService } from "../services/settingsService";

// Get all settings
export const getSettings: RequestHandler = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();

    const response: ApiResponse<any> = {
      success: true,
      data: settings,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getSettings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch settings",
    });
  }
};

// Update settings
export const updateSettings: RequestHandler = async (req, res) => {
  try {
    const settingsData = req.body;
    const settings = await settingsService.updateSettings(settingsData);

    const response: ApiResponse<any> = {
      success: true,
      data: settings,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in updateSettings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update settings",
    });
  }
};

// Update currency only
export const updateCurrency: RequestHandler = async (req, res) => {
  try {
    const { currency } = req.body;

    if (!currency) {
      return res.status(400).json({
        success: false,
        error: "Currency is required",
      });
    }

    await settingsService.updateCurrency(currency);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in updateCurrency:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update currency",
    });
  }
};

// Test WhatsApp notification
export const testWhatsAppNotification: RequestHandler = async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        success: false,
        error: "Number and message are required",
      });
    }

    // In a real implementation, you would integrate with WhatsApp API here
    // For now, we'll just simulate a successful response
    console.log(`WhatsApp test message to ${number}: ${message}`);

    const response: ApiResponse<any> = {
      success: true,
      data: { sent: true, number, message },
    };

    res.json(response);
  } catch (error) {
    console.error("Error in testWhatsAppNotification:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send test WhatsApp message",
    });
  }
};

// Get business settings only
export const getBusinessSettings: RequestHandler = async (req, res) => {
  try {
    const businessSettings = await settingsService.getBusinessSettings();

    const response: ApiResponse<any> = {
      success: true,
      data: businessSettings,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getBusinessSettings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch business settings",
    });
  }
};

// Get notification settings only
export const getNotificationSettings: RequestHandler = async (req, res) => {
  try {
    const notificationSettings =
      await settingsService.getNotificationSettings();

    const response: ApiResponse<any> = {
      success: true,
      data: notificationSettings,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getNotificationSettings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notification settings",
    });
  }
};
