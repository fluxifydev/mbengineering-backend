# How to Connect Your Public Frontend to the Firebase Backend

This guide explains in detail how to connect your public-facing frontend (e.g., the MB Engineering Works website) to the Firebase database where your admin dashboard stores all the product data.

Since your backend uses Firebase Firestore to store the data and Cloudinary to store the files, your frontend only needs to read from Firebase.

---

## Step 1: Install Firebase in your Frontend Project

In your frontend project folder, install the Firebase SDK:

```bash
npm install firebase
```

---

## Step 2: Set Up Firebase Configuration

Create a file named `firebase.js` (or `firebase/config.js`) in your frontend project. You will use the exact same Firebase credentials that you used for the backend.

```javascript
// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase safely for Next.js/React
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
```

**Note:** Make sure to copy the `.env.local` variables from your backend project into your frontend project's `.env.local` file!

---

## Step 3: Fetching All Products (e.g., for the "Machinery" Page)

To display all the machines on a catalog page, you need to query the `products` collection from Firestore.

Here is a complete React/Next.js example of how to fetch and display the products as cards:

```javascript
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase"; // Import the db from Step 2
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Query the "products" collection, ordered by newest first
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        const productsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading machines...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(product => (
        <div key={product.id} className="border rounded-lg p-4 shadow-sm">
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover mb-4" />
          )}
          <h2 className="text-xl font-bold">{product.name}</h2>
          <p className="text-gray-600 line-clamp-3">{product.description}</p>
          
          <Link href={`/products/${product.id}`} className="mt-4 block text-blue-600 font-bold">
            View Details &rarr;
          </Link>
        </div>
      ))}
    </div>
  );
}
```

---

## Step 4: Fetching a Single Product (The Details Page)

When a user clicks on a product, you want to show the full details, including the dynamic specifications table and the brochure download button.

Here is how you fetch a single product by its ID and render the specifications:

```javascript
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// In Next.js App Router, the URL ID comes from the `params` prop
export default function ProductDetailsPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const docRef = doc(db, "products", params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such product found!");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSingleProduct();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      
      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.name} className="w-full max-h-96 object-contain mb-8" />
      )}

      <p className="text-lg text-gray-700 mb-8">{product.description}</p>

      {/* --- RENDERING THE DYNAMIC SPECIFICATIONS TABLE --- */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Technical Parameters</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <tbody>
                {product.specifications.map((spec, index) => (
                  <tr key={index} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-blue-900 bg-white w-1/3">
                      {spec.key}
                    </td>
                    <td className="py-3 px-4 text-gray-700 bg-white">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rendering the Brochure Download Button */}
      {product.brochureUrl && (
        <a 
          href={product.brochureUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
        >
          Download Brochure (PDF)
        </a>
      )}
    </div>
  );
}
```

---

## Summary of the Data Structure

When you pull a product from Firebase, it will look exactly like this standard Javascript object:

```javascript
{
  id: "FIREBASE_GENERATED_ID",
  name: "CNC Milling Machine",
  description: "High speed slitting machine...",
  imageUrl: "https://res.cloudinary.com/...", // Direct link to image
  brochureUrl: "https://res.cloudinary.com/...", // Direct link to PDF
  createdAt: Timestamp,
  
  // This is the dynamic array we built in the admin panel!
  specifications: [
    { key: "Max Web Width", value: "1300 mm" },
    { key: "Max Slitting Speed", value: "350 m/min" },
    { key: "Max Rewind Diameter", value: "600 mm" }
  ]
}
```

### Important Notes:
1. **Cloudinary**: You do **not** need to install or configure Cloudinary on the frontend. The backend saves the direct, public Cloudinary URLs (`imageUrl` and `brochureUrl`) into Firebase. The frontend just uses those URLs inside standard `<img src={...} />` and `<a href={...} />` tags!
2. **Security**: As long as your Firebase Firestore rules are set to `allow read: if true;` (which we did earlier), the frontend will securely read this data without users needing to log in.
