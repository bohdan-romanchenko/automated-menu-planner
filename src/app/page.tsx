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
import {
  PlusIcon,
  DragHandleDots2Icon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from "../../lib/products";

interface SortableItemProps {
  product: Product;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

function SortableItem({ product, onToggle, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Flex
      ref={setNodeRef}
      style={style}
      align="center"
      justify="between"
      className="rounded-lg border border-gray-100 px-3 py-2.5 transition-colors hover:bg-gray-50 md:px-4 md:py-3.5"
    >
      <Flex gap="4" align="center" className="flex-1">
        <div {...attributes} {...listeners}>
          <DragHandleDots2Icon className="h-5 w-5 cursor-grab text-gray-400" />
        </div>
        <Checkbox
          checked={product.available}
          onCheckedChange={() => onToggle(product.id)}
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
      <button
        className="ml-2 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(product.id);
        }}
      >
        <Cross2Icon className="h-4 w-4" />
      </button>
    </Flex>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
      const maxOrder = Math.max(...products.map((p) => p.order), 0);
      const newProductData = await addProduct({
        name: newProduct.trim(),
        available: true,
        order: maxOrder + 1,
      });

      setProducts([...products, newProductData]);
      setNewProduct("");
      setError(null);
    } catch (err) {
      setError("Failed to add product");
      console.error("Error adding product:", err);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
      setError(null);
    } catch (err) {
      setError("Failed to delete product");
      console.error("Error deleting product:", err);
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    try {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);

      const newProducts = arrayMove(products, oldIndex, newIndex);
      setProducts(newProducts);

      // Update orders in the database
      const updates = newProducts.map((product, index) =>
        updateProduct(product.id, { order: index }),
      );
      await Promise.all(updates);
      setError(null);
    } catch (err) {
      setError("Failed to reorder products");
      console.error("Error reordering products:", err);
      // Reload products to ensure UI is in sync with DB
      void loadProducts();
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={products}
                strategy={verticalListSortingStrategy}
              >
                {products.map((product) => (
                  <SortableItem
                    key={product.id}
                    product={product}
                    onToggle={toggleProductAvailability}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </Box>
        </Box>
      </div>
    </div>
  );
}
