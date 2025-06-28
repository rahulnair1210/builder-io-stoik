import { db, isFirebaseAvailable, COLLECTIONS } from "../config/firebase";
import { Customer } from "@shared/types";
import { MockDataStore } from "./mockDataService";

export class CustomerService {
  private collection = isFirebaseAvailable
    ? db.collection(COLLECTIONS.CUSTOMERS)
    : null;

  async getAllCustomers(): Promise<Customer[]> {
    try {
      if (!isFirebaseAvailable) {
        return MockDataStore.getCustomers();
      }

      const snapshot = await this.collection.get();
      let customers: Customer[] = [];

      snapshot.forEach((doc) => {
        customers.push({ id: doc.id, ...doc.data() } as Customer);
      });

      // Sort by created date (newest first)
      customers.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return customers;
    } catch (error) {
      console.error("Error getting customers:", error);
      throw error;
    }
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      if (!isFirebaseAvailable) {
        return MockDataStore.getCustomerById(id);
      }

      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() } as Customer;
    } catch (error) {
      console.error("Error getting customer by ID:", error);
      throw error;
    }
  }

  async createCustomer(
    customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">,
  ): Promise<Customer> {
    try {
      const now = new Date().toISOString();
      const customer: Omit<Customer, "id"> = {
        ...customerData,
        totalSpent: customerData.totalSpent || 0,
        totalOrders: customerData.totalOrders || 0,
        createdAt: now,
        updatedAt: now,
      };

      if (!isFirebaseAvailable) {
        const newCustomer = {
          id: Math.random().toString(36).substr(2, 9),
          ...customer,
        };
        return MockDataStore.addCustomer(newCustomer);
      }

      const docRef = await this.collection.add(customer);
      return { id: docRef.id, ...customer };
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }

  async updateCustomer(
    id: string,
    updateData: Partial<Customer>,
  ): Promise<Customer> {
    try {
      const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      if (!isFirebaseAvailable) {
        return MockDataStore.updateCustomer(id, updatedData);
      }

      await this.collection.doc(id).update(updatedData);

      const updatedDoc = await this.collection.doc(id).get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Customer;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      if (!isFirebaseAvailable) {
        MockDataStore.deleteCustomer(id);
        return;
      }

      await this.collection.doc(id).delete();
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }

  async updateCustomerStats(
    customerId: string,
    orderValue: number,
  ): Promise<void> {
    try {
      if (!isFirebaseAvailable) {
        const customer = MockDataStore.getCustomerById(customerId);
        if (!customer) {
          console.warn(`Customer ${customerId} not found for stats update`);
          return; // Silently skip if customer not found
        }
        const newTotalSpent = (customer.totalSpent || 0) + orderValue;
        const newTotalOrders = (customer.totalOrders || 0) + 1;
        MockDataStore.updateCustomer(customerId, {
          totalSpent: newTotalSpent,
          totalOrders: newTotalOrders,
          updatedAt: new Date().toISOString(),
        });
        return;
      }

      const customerDoc = await this.collection.doc(customerId).get();
      if (!customerDoc.exists) {
        console.warn(`Customer ${customerId} not found for stats update`);
        return; // Silently skip if customer not found
      }

      const customer = customerDoc.data() as Customer;
      const newTotalSpent = (customer.totalSpent || 0) + orderValue;
      const newTotalOrders = (customer.totalOrders || 0) + 1;

      await this.collection.doc(customerId).update({
        totalSpent: newTotalSpent,
        totalOrders: newTotalOrders,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating customer stats:", error);
      // Don't throw error, just log it
      console.warn("Customer stats update failed, continuing...");
    }
  }

  // Seed initial data for development
  async seedInitialData(): Promise<void> {
    try {
      const snapshot = await this.collection.limit(1).get();
      if (!snapshot.empty) {
        console.log("Customers collection already has data, skipping seed");
        return;
      }

      const initialCustomers: Omit<Customer, "id">[] = [
        {
          name: "John Smith",
          email: "john@example.com",
          phone: "+1-555-0123",
          address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
          },
          totalSpent: 145.5,
          totalOrders: 3,
          preferredContactMethod: "email",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Sarah Johnson",
          email: "sarah@example.com",
          phone: "+1-555-0124",
          address: {
            street: "456 Oak Ave",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90210",
            country: "USA",
          },
          totalSpent: 89.99,
          totalOrders: 2,
          preferredContactMethod: "phone",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const batch = db.batch();
      initialCustomers.forEach((customer) => {
        const docRef = this.collection.doc();
        batch.set(docRef, customer);
      });

      await batch.commit();
      console.log("Initial customers seeded successfully");
    } catch (error) {
      console.error("Error seeding customer data:", error);
    }
  }
}

export const customerService = new CustomerService();
