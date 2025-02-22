"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Heading,
  Box,
  Flex,
  Text,
  Button,
  Checkbox,
} from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from "../../lib/products";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const dbProducts = await getAllProducts();
      setProducts(dbProducts);
      setError(null);
    } catch (err) {
      setError("Failed to load products");
      console.error("Error loading products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.trim()) return;

    try {
      const newProductData = await addProduct({
        name: newProduct.trim(),
        available: true,
      });

      setProducts([...products, newProductData]);
      setNewProduct("");
      setError(null);
    } catch (err) {
      setError("Failed to add product");
      console.error("Error adding product:", err);
    }
  };

  const toggleProductAvailability = async (productId: number) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const updatedProduct = await updateProduct(productId, {
        available: !product.available,
      });

      setProducts(
        products.map((p) => (p.id === productId ? updatedProduct : p)),
      );
      setError(null);
    } catch (err) {
      setError("Failed to update product");
      console.error("Error updating product:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 md:px-6">
      <div className="w-full max-w-[400px]">
        <Box className="rounded-xl bg-white p-4 shadow-lg md:p-8">
          <Heading size="6" mb="6" className="text-center">
            My Kitchen Inventory
          </Heading>

          {error && (
            <Text className="mb-4 text-center text-red-500">{error}</Text>
          )}

          <Box mb="6 md:mb-8">
            <Flex className="gap-2 md:gap-3" align="center">
              <input
                type="text"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                placeholder="Add new product..."
                className="h-11 flex-1 rounded-lg border border-gray-200 px-3 text-base focus:border-blue-500 focus:outline-none md:h-14 md:px-5"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    void handleAddProduct();
                  }
                }}
              />
              <Button
                onClick={() => void handleAddProduct()}
                className="inline-flex h-11 items-center justify-center bg-[#B7E33B] px-3 text-base font-medium hover:bg-[#a5ce34] md:h-14 md:px-5"
              >
                <PlusIcon width="18" height="18" className="mr-1" />
                <span className="hidden md:inline">Add</span>
              </Button>
            </Flex>
          </Box>

          <Box className="mt-3 space-y-2 md:space-y-3">
            {products.map((product) => (
              <Flex
                key={product.id}
                align="center"
                justify="between"
                className="cursor-pointer rounded-lg border border-gray-100 px-3 py-2.5 transition-colors hover:bg-gray-50 md:px-4 md:py-3.5"
                onClick={() => void toggleProductAvailability(product.id)}
              >
                <Flex gap="4" align="center">
                  <Checkbox
                    checked={product.available}
                    onCheckedChange={() =>
                      void toggleProductAvailability(product.id)
                    }
                    size="3"
                  />
                  <Text
                    className={`select-none text-base ${
                      product.available ? "" : "text-gray-400"
                    }`}
                  >
                    {product.name}
                  </Text>
                </Flex>
              </Flex>
            ))}
          </Box>
        </Box>
      </div>
    </div>
  );
}
