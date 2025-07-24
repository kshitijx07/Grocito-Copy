// Sample product data for testing the Product Management system
export const sampleProducts = [
  {
    id: 1,
    name: "Fresh Red Apples",
    description: "Crisp and sweet red apples, perfect for snacking or baking. Rich in fiber and vitamins.",
    price: 120,
    category: "Fruits & Vegetables",
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    pincode: "110001",
    stock: 50
  },
  {
    id: 2,
    name: "Organic Bananas",
    description: "Fresh organic bananas, naturally ripened and packed with potassium and energy.",
    price: 60,
    category: "Fruits & Vegetables",
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
    pincode: "110001",
    stock: 8
  },
  {
    id: 3,
    name: "Whole Milk 1L",
    description: "Fresh whole milk from local dairy farms. Rich in calcium and protein.",
    price: 55,
    category: "Dairy & Eggs",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
    pincode: "110001",
    stock: 25
  },
  {
    id: 4,
    name: "Brown Bread Loaf",
    description: "Freshly baked whole wheat brown bread. High in fiber and nutrients.",
    price: 45,
    category: "Bakery",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    pincode: "110001",
    stock: 0
  },
  {
    id: 5,
    name: "Basmati Rice 5kg",
    description: "Premium quality basmati rice with long grains and aromatic fragrance.",
    price: 450,
    category: "Pantry Staples",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    pincode: "110001",
    stock: 15
  },
  {
    id: 6,
    name: "Fresh Chicken Breast",
    description: "Fresh boneless chicken breast, perfect for grilling or cooking. High in protein.",
    price: 280,
    category: "Meat & Seafood",
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400",
    pincode: "110001",
    stock: 12
  },
  {
    id: 7,
    name: "Orange Juice 1L",
    description: "Fresh squeezed orange juice, no added sugar. Rich in Vitamin C.",
    price: 85,
    category: "Beverages",
    imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400",
    pincode: "110001",
    stock: 20
  },
  {
    id: 8,
    name: "Potato Chips",
    description: "Crispy and delicious potato chips, perfect for snacking.",
    price: 35,
    category: "Snacks",
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",
    pincode: "110001",
    stock: 5
  },
  {
    id: 9,
    name: "Frozen Peas 500g",
    description: "Fresh frozen green peas, perfect for cooking and rich in nutrients.",
    price: 75,
    category: "Frozen Foods",
    imageUrl: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400",
    pincode: "110001",
    stock: 30
  },
  {
    id: 10,
    name: "Hand Sanitizer 250ml",
    description: "Alcohol-based hand sanitizer for effective germ protection.",
    price: 95,
    category: "Personal Care",
    imageUrl: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400",
    pincode: "110001",
    stock: 18
  },
  {
    id: 11,
    name: "Dishwashing Liquid",
    description: "Effective dishwashing liquid that cuts through grease and grime.",
    price: 125,
    category: "Household Items",
    imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400",
    pincode: "110001",
    stock: 22
  },
  {
    id: 12,
    name: "Baby Diapers Pack",
    description: "Soft and comfortable baby diapers with excellent absorption.",
    price: 650,
    category: "Baby Care",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400",
    pincode: "110001",
    stock: 8
  },
  {
    id: 13,
    name: "Vitamin C Tablets",
    description: "Essential Vitamin C supplements for immune system support.",
    price: 180,
    category: "Health & Wellness",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    pincode: "110001",
    stock: 35
  },
  {
    id: 14,
    name: "Fresh Tomatoes 1kg",
    description: "Fresh red tomatoes, perfect for cooking and salads. Rich in lycopene.",
    price: 40,
    category: "Fruits & Vegetables",
    imageUrl: "https://images.unsplash.com/photo-1546470427-e5380b6d0b66?w=400",
    pincode: "110001",
    stock: 0
  },
  {
    id: 15,
    name: "Greek Yogurt 500g",
    description: "Creamy Greek yogurt with probiotics. High in protein and calcium.",
    price: 150,
    category: "Dairy & Eggs",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    pincode: "110001",
    stock: 16
  }
];

// Helper function to get analytics from sample data
export const getSampleAnalytics = () => {
  const totalProducts = sampleProducts.length;
  const categories = [...new Set(sampleProducts.map(p => p.category))];
  const lowStockCount = sampleProducts.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = sampleProducts.filter(p => p.stock === 0).length;
  const averagePrice = sampleProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts;
  
  const categoryDistribution = sampleProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  
  const stockDistribution = {
    inStock: sampleProducts.filter(p => p.stock > 10).length,
    lowStock: lowStockCount,
    outOfStock: outOfStockCount
  };
  
  return {
    totalProducts,
    totalCategories: categories.length,
    lowStockCount,
    outOfStockCount,
    averagePrice,
    categoryDistribution,
    stockDistribution
  };
};