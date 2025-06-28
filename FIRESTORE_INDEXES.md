# Firestore Indexes Setup (Optional Performance Optimization)

The app now works without indexes by using in-memory filtering. However, for better performance with large datasets, you can create these indexes in your Firebase console:

## How to Create Indexes

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `stoik-crafters`
3. Go to Firestore Database > Indexes
4. Click "Create Index"

## Recommended Indexes

### Products Collection (`products`)

**For inventory filtering with stock status:**

- Collection ID: `products`
- Fields:
  - `stockLevel` (Ascending)
  - `updatedAt` (Descending)

**For category filtering:**

- Collection ID: `products`
- Fields:
  - `category` (Ascending)
  - `updatedAt` (Descending)

### Orders Collection (`orders`)

**For order filtering by status:**

- Collection ID: `orders`
- Fields:
  - `status` (Ascending)
  - `orderDate` (Descending)

**For customer order history:**

- Collection ID: `orders`
- Fields:
  - `customerId` (Ascending)
  - `orderDate` (Descending)

### Customers Collection (`customers`)

**For customer sorting:**

- Collection ID: `customers`
- Fields:
  - `createdAt` (Descending)

## Current Status

✅ **App works without indexes** - All filtering is done in-memory
✅ **Firebase connection active** - Data is stored in Firestore
✅ **No index errors** - Queries are simplified to avoid index requirements

## Performance Impact

- **Without indexes**: Works fine for small to medium datasets (< 1000 records per collection)
- **With indexes**: Better performance for large datasets and complex queries

## Auto-Generated Indexes

If you want to automatically create indexes, you can:

1. Enable complex queries temporarily in your services
2. Run the app and perform various operations
3. Firebase will provide index creation links in the console logs
4. Click the links to auto-create the required indexes

Your T-shirt inventory system is now fully functional with Firebase! 🚀
