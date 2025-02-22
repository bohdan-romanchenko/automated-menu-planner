"use client";

import { useState } from "react";
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

interface Product {
  id: string;
  name: string;
  available: boolean;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "Tomatoes", available: true },
    { id: "2", name: "Potatoes", available: false },
    { id: "3", name: "Onions", available: true },
  ]);
  const [newProduct, setNewProduct] = useState("");

  const handleAddProduct = () => {
    if (newProduct.trim()) {
      setProducts([
        ...products,
        {
          id: Date.now().toString(),
          name: newProduct.trim(),
          available: true,
        },
      ]);
      setNewProduct("");
    }
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? { ...product, available: !product.available }
          : product,
      ),
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 md:px-6">
      <div className="w-full max-w-[400px]">
        <Box className="rounded-xl bg-white p-4 shadow-lg md:p-8">
          <Heading size="6" mb="6" className="text-center">
            My Kitchen Inventory
          </Heading>

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
                    handleAddProduct();
                  }
                }}
              />
              <Button
                onClick={handleAddProduct}
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
                onClick={() => toggleProductAvailability(product.id)}
              >
                <Flex gap="4" align="center">
                  <Checkbox
                    checked={product.available}
                    onCheckedChange={() =>
                      toggleProductAvailability(product.id)
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
