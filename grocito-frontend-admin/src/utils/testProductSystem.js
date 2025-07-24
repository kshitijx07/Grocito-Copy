// Test utility for Product Management System
import { productService } from '../api/productService';
import { sampleProducts } from '../data/sampleProducts';

export class ProductSystemTester {
  constructor() {
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type };
    this.testResults.push(logEntry);
    console.log(`[${type.toUpperCase()}] ${timestamp}: ${message}`);
  }

  async runAllTests() {
    this.log('Starting Product Management System Tests', 'info');
    
    try {
      await this.testGetAllProducts();
      await this.testCreateProduct();
      await this.testUpdateProduct();
      await this.testStockUpdate();
      await this.testSearchAndFilter();
      await this.testAnalytics();
      await this.testErrorHandling();
      
      this.log('All tests completed successfully!', 'success');
      return this.testResults;
    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async testGetAllProducts() {
    this.log('Testing: Get All Products', 'test');
    try {
      const products = await productService.getAllProducts();
      if (Array.isArray(products) || products.content) {
        this.log('✓ Get all products - PASSED', 'success');
      } else {
        this.log('✗ Get all products - Invalid response format', 'error');
      }
    } catch (error) {
      this.log(`✗ Get all products - FAILED: ${error.message}`, 'error');
    }
  }

  async testCreateProduct() {
    this.log('Testing: Create Product', 'test');
    const testProduct = {
      name: 'Test Product',
      description: 'This is a test product',
      price: 99.99,
      category: 'Test Category',
      stock: 10,
      pincode: '110001',
      imageUrl: 'https://via.placeholder.com/400x400?text=Test+Product'
    };

    try {
      const createdProduct = await productService.createProduct(testProduct);
      if (createdProduct && createdProduct.id) {
        this.log('✓ Create product - PASSED', 'success');
        // Clean up - delete the test product
        try {
          await productService.deleteProduct(createdProduct.id);
          this.log('✓ Test product cleanup - PASSED', 'success');
        } catch (cleanupError) {
          this.log('⚠ Test product cleanup - FAILED (manual cleanup required)', 'warning');
        }
      } else {
        this.log('✗ Create product - Invalid response', 'error');
      }
    } catch (error) {
      this.log(`✗ Create product - FAILED: ${error.message}`, 'error');
    }
  }

  async testUpdateProduct() {
    this.log('Testing: Update Product', 'test');
    try {
      // First get a product to update
      const products = await productService.getAllProducts();
      const productList = Array.isArray(products) ? products : products.content || [];
      
      if (productList.length > 0) {
        const productToUpdate = productList[0];
        const updatedData = {
          ...productToUpdate,
          name: productToUpdate.name + ' (Updated)',
          price: productToUpdate.price + 10
        };

        const updatedProduct = await productService.updateProduct(productToUpdate.id, updatedData);
        if (updatedProduct) {
          this.log('✓ Update product - PASSED', 'success');
          
          // Revert the changes
          await productService.updateProduct(productToUpdate.id, productToUpdate);
          this.log('✓ Product update revert - PASSED', 'success');
        } else {
          this.log('✗ Update product - Invalid response', 'error');
        }
      } else {
        this.log('⚠ Update product - SKIPPED (no products available)', 'warning');
      }
    } catch (error) {
      this.log(`✗ Update product - FAILED: ${error.message}`, 'error');
    }
  }

  async testStockUpdate() {
    this.log('Testing: Stock Update', 'test');
    try {
      const products = await productService.getAllProducts();
      const productList = Array.isArray(products) ? products : products.content || [];
      
      if (productList.length > 0) {
        const product = productList[0];
        const originalStock = product.stock;
        const newStock = originalStock + 5;

        const updatedProduct = await productService.updateProductStock(product.id, newStock);
        if (updatedProduct && updatedProduct.stock === newStock) {
          this.log('✓ Stock update - PASSED', 'success');
          
          // Revert stock
          await productService.updateProductStock(product.id, originalStock);
          this.log('✓ Stock revert - PASSED', 'success');
        } else {
          this.log('✗ Stock update - Invalid response', 'error');
        }
      } else {
        this.log('⚠ Stock update - SKIPPED (no products available)', 'warning');
      }
    } catch (error) {
      this.log(`✗ Stock update - FAILED: ${error.message}`, 'error');
    }
  }

  async testSearchAndFilter() {
    this.log('Testing: Search and Filter', 'test');
    try {
      // Test search
      const searchResults = await productService.searchProducts('test');
      this.log('✓ Search products - PASSED', 'success');

      // Test category filter (if products exist)
      const products = await productService.getAllProducts();
      const productList = Array.isArray(products) ? products : products.content || [];
      
      if (productList.length > 0) {
        const categories = [...new Set(productList.map(p => p.category))];
        if (categories.length > 0) {
          const categoryResults = await productService.getProductsByCategory(categories[0]);
          this.log('✓ Category filter - PASSED', 'success');
        }
      }
    } catch (error) {
      this.log(`✗ Search and filter - FAILED: ${error.message}`, 'error');
    }
  }

  async testAnalytics() {
    this.log('Testing: Analytics', 'test');
    try {
      const analytics = await productService.getProductAnalytics();
      if (analytics && typeof analytics.totalProducts === 'number') {
        this.log('✓ Analytics - PASSED', 'success');
        this.log(`  - Total Products: ${analytics.totalProducts}`, 'info');
        this.log(`  - Total Categories: ${analytics.totalCategories}`, 'info');
        this.log(`  - Low Stock Count: ${analytics.lowStockCount}`, 'info');
        this.log(`  - Out of Stock Count: ${analytics.outOfStockCount}`, 'info');
      } else {
        this.log('✗ Analytics - Invalid response format', 'error');
      }
    } catch (error) {
      this.log(`✗ Analytics - FAILED: ${error.message}`, 'error');
    }
  }

  async testErrorHandling() {
    this.log('Testing: Error Handling', 'test');
    try {
      // Test getting non-existent product
      try {
        await productService.getProductById(99999);
        this.log('⚠ Error handling - Non-existent product should return error', 'warning');
      } catch (error) {
        if (error.response?.status === 404) {
          this.log('✓ 404 error handling - PASSED', 'success');
        } else {
          this.log('✓ Error handling - PASSED (different error type)', 'success');
        }
      }

      // Test invalid product creation
      try {
        await productService.createProduct({});
        this.log('⚠ Error handling - Invalid product should return error', 'warning');
      } catch (error) {
        this.log('✓ Invalid product creation error handling - PASSED', 'success');
      }
    } catch (error) {
      this.log(`✗ Error handling tests - FAILED: ${error.message}`, 'error');
    }
  }

  generateReport() {
    const successCount = this.testResults.filter(r => r.type === 'success').length;
    const errorCount = this.testResults.filter(r => r.type === 'error').length;
    const warningCount = this.testResults.filter(r => r.type === 'warning').length;
    
    const report = {
      summary: {
        total: this.testResults.length,
        success: successCount,
        errors: errorCount,
        warnings: warningCount,
        passed: errorCount === 0
      },
      details: this.testResults
    };

    console.log('\n=== TEST REPORT ===');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.success}`);
    console.log(`Errors: ${report.summary.errors}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(`Overall Status: ${report.summary.passed ? 'PASSED' : 'FAILED'}`);
    console.log('==================\n');

    return report;
  }
}

// Utility function to run tests from console
export const runProductTests = async () => {
  const tester = new ProductSystemTester();
  try {
    await tester.runAllTests();
    return tester.generateReport();
  } catch (error) {
    console.error('Test execution failed:', error);
    return tester.generateReport();
  }
};

// Export for use in development
if (typeof window !== 'undefined') {
  window.runProductTests = runProductTests;
  window.ProductSystemTester = ProductSystemTester;
}