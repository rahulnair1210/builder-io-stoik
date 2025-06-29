import { db, isFirebaseAvailable, COLLECTIONS } from "../config/firebase";
import { TShirt } from "@shared/types";
import { MockDataStore } from "./mockDataService";

export class InventoryService {
  private collection = isFirebaseAvailable
    ? db.collection(COLLECTIONS.PRODUCTS)
    : null;

  async getAllProducts(filters?: any): Promise<TShirt[]> {
    try {
      if (!isFirebaseAvailable) {
        // Use mock data when Firebase is not available
        let products = MockDataStore.getProducts();

        // Apply filters to mock data
        if (filters?.category && filters.category !== "all") {
          products = products.filter((p) => p.category === filters.category);
        }

        if (filters?.stockStatus) {
          if (filters.stockStatus === "low_stock") {
            products = products.filter(
              (p) => p.stockLevel <= p.minStockLevel && p.stockLevel > 0,
            );
          } else if (filters.stockStatus === "out_of_stock") {
            products = products.filter((p) => p.stockLevel === 0);
          } else if (filters.stockStatus === "in_stock") {
            products = products.filter((p) => p.stockLevel > p.minStockLevel);
          }
        }

        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          products = products.filter(
            (product) =>
              product.name.toLowerCase().includes(searchTerm) ||
              product.design.toLowerCase().includes(searchTerm) ||
              product.color.toLowerCase().includes(searchTerm) ||
              product.category.toLowerCase().includes(searchTerm),
          );
        }

        return products;
      }

      let query = this.collection;

      // Get all products first, then filter in memory to avoid index requirements
      const snapshot = await this.collection.get();

      let products: TShirt[] = [];
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as TShirt);
      });

      // Apply all filters in memory to avoid index requirements
      if (filters?.category && filters.category !== "all") {
        products = products.filter((p) => p.category === filters.category);
      }

      if (filters?.stockStatus) {
        if (filters.stockStatus === "low_stock") {
          products = products.filter(
            (p) => p.stockLevel <= p.minStockLevel && p.stockLevel > 0,
          );
        } else if (filters.stockStatus === "out_of_stock") {
          products = products.filter((p) => p.stockLevel === 0);
        } else if (filters.stockStatus === "in_stock") {
          products = products.filter((p) => p.stockLevel > p.minStockLevel);
        }
      }

      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        products = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.design.toLowerCase().includes(searchTerm) ||
            product.color.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm),
        );
      }

      // Sort by updated date (newest first)
      products.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

      return products;
    } catch (error) {
      console.error("Error getting products:", error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<TShirt | null> {
    try {
      if (!isFirebaseAvailable) {
        return MockDataStore.getProductById(id);
      }

      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() } as TShirt;
    } catch (error) {
      console.error("Error getting product by ID:", error);
      throw error;
    }
  }

  async createProduct(
    productData: Omit<TShirt, "id" | "createdAt" | "updatedAt">,
  ): Promise<TShirt> {
    try {
      const now = new Date().toISOString();
      const product: TShirt = {
        ...productData,
        id: !isFirebaseAvailable ? Date.now().toString() : "",
        createdAt: now,
        updatedAt: now,
      };

      if (!isFirebaseAvailable) {
        return MockDataStore.addProduct(product);
      }

      const docRef = await this.collection.add(product);
      return { id: docRef.id, ...product };
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async updateProduct(
    id: string,
    updateData: Partial<TShirt>,
  ): Promise<TShirt> {
    try {
      const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      if (!isFirebaseAvailable) {
        return MockDataStore.updateProduct(id, updatedData);
      }

      await this.collection.doc(id).update(updatedData);

      const updatedDoc = await this.collection.doc(id).get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as TShirt;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete();
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  async updateStock(id: string, newStock: number): Promise<TShirt> {
    try {
      const updateData = {
        stockLevel: newStock,
        updatedAt: new Date().toISOString(),
      };

      await this.collection.doc(id).update(updateData);

      const updatedDoc = await this.collection.doc(id).get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as TShirt;
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  }

  async getLowStockProducts(): Promise<TShirt[]> {
    try {
      if (!isFirebaseAvailable) {
        return MockDataStore.getProducts()
          .filter((p) => p.stockLevel <= 10)
          .sort((a, b) => a.stockLevel - b.stockLevel);
      }

      const snapshot = await this.collection.get();

      const products: TShirt[] = [];
      snapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() } as TShirt;
        if (product.stockLevel <= 10) {
          products.push(product);
        }
      });

      // Sort by stock level (lowest first)
      products.sort((a, b) => a.stockLevel - b.stockLevel);

      return products;
    } catch (error) {
      console.error("Error getting low stock products:", error);
      throw error;
    }
  }

  // Seed initial data for development
  async seedInitialData(): Promise<void> {
    try {
      const snapshot = await this.collection.limit(1).get();
      if (!snapshot.empty) {
        console.log("Products collection already has data, skipping seed");
        return;
      }

      const initialProducts: Omit<TShirt, "id">[] = [
        {
          name: "Classic Cotton Tee",
          design: "Vintage Logo",
          size: "M",
          color: "Black",
          stockLevel: 15,
          minStockLevel: 10,
          costPrice: 8.5,
          sellingPrice: 19.99,
          category: "Casual",
          tags: ["cotton", "classic", "logo"],
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Sport Performance Tee",
          design: "Athletic Stripe",
          size: "L",
          color: "Navy",
          stockLevel: 3,
          minStockLevel: 5,
          costPrice: 12.0,
          sellingPrice: 24.99,
          category: "Sports",
          tags: ["athletic", "performance", "moisture-wicking"],
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Premium Cotton Blend",
          design: "Minimalist",
          size: "S",
          color: "White",
          stockLevel: 0,
          minStockLevel: 8,
          costPrice: 15.0,
          sellingPrice: 34.99,
          category: "Premium",
          tags: ["premium", "soft", "blend"],
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const batch = db.batch();
      initialProducts.forEach((product) => {
        const docRef = this.collection.doc();
        batch.set(docRef, product);
      });

      await batch.commit();
      console.log("Initial products seeded successfully");
    } catch (error) {
      console.error("Error seeding initial data:", error);
    }
  }
}

export const inventoryService = new InventoryService();
