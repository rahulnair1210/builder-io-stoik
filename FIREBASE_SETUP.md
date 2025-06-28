# Firebase Setup Guide

This guide will help you set up Firebase Firestore as the database for your T-shirt inventory management system.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "stoik-inventory")
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development (you can change security rules later)
4. Select a location for your database

## 3. Create Service Account Credentials

1. Go to Project Settings (gear icon) > "Service Accounts"
2. Click "Generate new private key"
3. Download the JSON file
4. Keep this file secure - it contains admin credentials

## 4. Set Up Environment Variables

Create a `.env` file in your project root with the following variables:

```env
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
PORT=3001
NODE_ENV=development
```

**Important**:

- Replace the values with your actual Firebase credentials
- Keep the quotes around the private key
- Don't commit the `.env` file to version control

## 5. Firestore Collections Structure

The application will automatically create these collections:

### Products Collection (`products`)

```javascript
{
  id: "auto-generated",
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
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Customers Collection (`customers`)

```javascript
{
  id: "auto-generated",
  name: "John Smith",
  email: "john@example.com",
  phone: "+1-555-0123",
  address: {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA"
  },
  totalSpent: 145.5,
  orderCount: 3,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Orders Collection (`orders`)

```javascript
{
  id: "auto-generated",
  customerId: "customer-id",
  items: [
    {
      tshirtId: "product-id",
      name: "Classic Cotton Tee",
      size: "M",
      color: "Black",
      quantity: 2,
      cost: 8.5,
      price: 19.99,
      unitSelling: 19.99,
      totalSelling: 39.98,
      profit: 22.98
    }
  ],
  totalCost: 17.0,
  totalSelling: 39.98,
  profit: 22.98,
  status: "pending",
  paymentMethod: "card",
  paymentStatus: "pending",
  paymentDate: null,
  orderDate: "2024-01-01T00:00:00.000Z",
  notes: "",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Settings Collection (`settings`)

```javascript
{
  id: "app_settings",
  business: {
    businessName: "Stoik T-Shirt Store",
    address: "",
    phone: "",
    email: "",
    currency: "USD",
    taxRate: 0,
    defaultMinStock: 5
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
    lowStockThreshold: 5
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## 6. Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Seed initial data (optional):
   ```bash
   curl -X POST http://localhost:3001/api/seed-all
   ```

## 7. Security Rules (Production)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 8. API Endpoints

The application provides these API endpoints:

### Inventory

- `GET /api/inventory` - Get all products
- `POST /api/inventory` - Create product
- `PUT /api/inventory/:id` - Update product
- `DELETE /api/inventory/:id` - Delete product
- `PATCH /api/inventory/:id/stock` - Update stock

### Customers

- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Orders

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status

### Analytics

- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/recent-orders` - Recent orders
- `GET /api/analytics/low-stock` - Low stock alerts

### Settings

- `GET /api/settings` - Get settings
- `POST /api/settings` - Update settings
- `PATCH /api/settings/currency` - Update currency

## 9. Troubleshooting

### Common Issues:

1. **"Permission denied" errors**: Check your Firestore security rules
2. **"Project not found"**: Verify your `FIREBASE_PROJECT_ID`
3. **"Invalid credentials"**: Check your service account JSON values
4. **"Module not found"**: Run `npm install` to install dependencies

### Logs:

Check the server console for detailed error messages and Firebase connection status.

## 10. Data Migration

If you're migrating from the old mock data system:

1. The application will automatically seed initial data if collections are empty
2. Use the `/api/seed-all` endpoint to populate sample data
3. Export your existing data and import it using the API endpoints

Your T-shirt inventory system is now powered by Firebase Firestore! 🚀
