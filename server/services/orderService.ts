import { db, COLLECTIONS } from "../config/firebase";
import { Order, OrderItem } from "@shared/types";
import { customerService } from "./customerService";
import { inventoryService } from "./inventoryService";

export class OrderService {
  private collection = db.collection(COLLECTIONS.ORDERS);

  async getAllOrders(filters?: any): Promise<Order[]> {
    try {
      let query = this.collection;

      // Apply filters
      if (filters?.status && filters.status !== "all") {
        query = query.where("status", "==", filters.status);
      }

      if (filters?.customerId) {
        query = query.where("customerId", "==", filters.customerId);
      }

      if (filters?.minItems) {
        // This filter will be applied on the client side since Firestore
        // doesn't support array length queries easily
      }

      const snapshot = await query.orderBy("orderDate", "desc").get();

      let orders: Order[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      // Apply additional filters
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        orders = orders.filter(
          (order) =>
            order.id.toLowerCase().includes(searchTerm) ||
            order.customer?.name?.toLowerCase().includes(searchTerm) ||
            order.customer?.email?.toLowerCase().includes(searchTerm),
        );
      }

      if (filters?.minItems) {
        const minItems = parseInt(filters.minItems);
        orders = orders.filter((order) => order.items.length >= minItems);
      }

      return orders;
    } catch (error) {
      console.error("Error getting orders:", error);
      throw error;
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() } as Order;
    } catch (error) {
      console.error("Error getting order by ID:", error);
      throw error;
    }
  }

  async createOrder(
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">,
  ): Promise<Order> {
    try {
      const now = new Date().toISOString();

      // Calculate totals
      let totalCost = 0;
      let totalSelling = 0;

      const processedItems: OrderItem[] = [];

      for (const item of orderData.items) {
        const product = await inventoryService.getProductById(item.tshirtId);
        if (!product) {
          throw new Error(`Product not found: ${item.tshirtId}`);
        }

        // Check stock availability
        if (product.stockLevel < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stockLevel}, Requested: ${item.quantity}`,
          );
        }

        const itemCost = product.costPrice * item.quantity;
        const itemSelling = product.sellingPrice * item.quantity;

        processedItems.push({
          ...item,
          name: product.name,
          size: product.size,
          color: product.color,
          cost: product.costPrice,
          price: product.sellingPrice,
          unitSelling: product.sellingPrice,
          totalSelling: itemSelling,
          profit: itemSelling - itemCost,
        });

        totalCost += itemCost;
        totalSelling += itemSelling;

        // Update stock
        await inventoryService.updateStock(
          item.tshirtId,
          product.stockLevel - item.quantity,
        );
      }

      const order: Omit<Order, "id"> = {
        ...orderData,
        items: processedItems,
        totalCost,
        totalSelling,
        profit: totalSelling - totalCost,
        orderDate: now,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.collection.add(order);

      // Update customer stats
      if (orderData.customerId) {
        await customerService.updateCustomerStats(
          orderData.customerId,
          totalSelling,
        );
      }

      return { id: docRef.id, ...order };
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async updateOrder(id: string, updateData: Partial<Order>): Promise<Order> {
    try {
      const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      await this.collection.doc(id).update(updatedData);

      const updatedDoc = await this.collection.doc(id).get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Order;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  }

  async updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString(),
      };

      // Set payment date when order is delivered
      if (status === "delivered") {
        updateData.paymentDate = new Date().toISOString();
      }

      await this.collection.doc(id).update(updateData);

      const updatedDoc = await this.collection.doc(id).get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Order;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete();
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
      const snapshot = await this.collection
        .where("customerId", "==", customerId)
        .orderBy("orderDate", "desc")
        .get();

      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      return orders;
    } catch (error) {
      console.error("Error getting orders by customer:", error);
      throw error;
    }
  }

  // Seed initial data for development
  async seedInitialData(): Promise<void> {
    try {
      const snapshot = await this.collection.limit(1).get();
      if (!snapshot.empty) {
        console.log("Orders collection already has data, skipping seed");
        return;
      }

      console.log(
        "Orders collection is empty, would seed data but need customers and products first",
      );
      // Note: Orders require existing customers and products, so they should be seeded after those
    } catch (error) {
      console.error("Error checking orders collection:", error);
    }
  }
}

export const orderService = new OrderService();
