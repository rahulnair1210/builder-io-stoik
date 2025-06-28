import { db, isFirebaseAvailable, COLLECTIONS } from "../config/firebase";
import { MockDataStore } from "./mockDataService";

interface BusinessSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxRate: number;
  defaultMinStock: number;
}

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

interface AppSettings {
  business: BusinessSettings;
  notifications: NotificationSettings;
}

export class SettingsService {
  private collection = isFirebaseAvailable
    ? db.collection(COLLECTIONS.SETTINGS)
    : null;
  private docId = "app_settings"; // Single document for all settings

  async getSettings(): Promise<AppSettings> {
    try {
      if (!isFirebaseAvailable) {
        return MockDataStore.getSettings() as AppSettings;
      }

      const doc = await this.collection.doc(this.docId).get();

      if (!doc.exists) {
        // Return default settings if none exist
        const defaultSettings: AppSettings = {
          business: {
            businessName: "Stoik T-Shirt Store",
            address: "",
            phone: "",
            email: "",
            currency: "USD",
            taxRate: 0,
            defaultMinStock: 5,
          },
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
        };

        // Create the document with default settings
        await this.collection.doc(this.docId).set({
          ...defaultSettings,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        return defaultSettings;
      }

      const data = doc.data() as AppSettings;
      return data;
    } catch (error) {
      console.error("Error getting settings:", error);
      throw error;
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    try {
      if (!isFirebaseAvailable) {
        return MockDataStore.updateSettings(settings);
      }

      const updateData = {
        ...settings,
        updatedAt: new Date().toISOString(),
      };

      await this.collection.doc(this.docId).update(updateData);

      // Return updated settings
      return await this.getSettings();
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }

  async updateCurrency(currency: string): Promise<void> {
    try {
      await this.collection.doc(this.docId).update({
        "business.currency": currency,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating currency:", error);
      throw error;
    }
  }

  async getBusinessSettings(): Promise<BusinessSettings> {
    try {
      const settings = await this.getSettings();
      return settings.business;
    } catch (error) {
      console.error("Error getting business settings:", error);
      throw error;
    }
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settings = await this.getSettings();
      return settings.notifications;
    } catch (error) {
      console.error("Error getting notification settings:", error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();
