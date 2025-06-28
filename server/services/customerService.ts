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

      const snapshot = await this.collection.orderBy("createdAt", "desc").get();
      const customers: Customer[] = [];

      snapshot.forEach((doc) => {
        customers.push({ id: doc.id, ...doc.data() } as Customer);
      });

      return customers;
    } catch (error) {
      console.error("Error getting customers:", error);
      throw error;
    }
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
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
        orderCount: customerData.orderCount || 0,
        createdAt: now,
        updatedAt: now,
      };

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
      const customerDoc = await this.collection.doc(customerId).get();
      if (!customerDoc.exists) {
        throw new Error("Customer not found");
      }

      const customer = customerDoc.data() as Customer;
      const newTotalSpent = (customer.totalSpent || 0) + orderValue;
      const newOrderCount = (customer.orderCount || 0) + 1;

      await this.collection.doc(customerId).update({
        totalSpent: newTotalSpent,
        orderCount: newOrderCount,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating customer stats:", error);
      throw error;
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
          orderCount: 3,
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
          orderCount: 2,
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
