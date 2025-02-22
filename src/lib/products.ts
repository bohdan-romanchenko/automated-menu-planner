import { supabase } from "./supabase";
import { type Database } from "../types/supabase";
import {
  type SupabaseClient,
  type PostgrestError,
  type PostgrestSingleResponse,
  type PostgrestResponse,
} from "@supabase/supabase-js";

type Tables = Database["public"]["Tables"];
type Product = Tables["products"]["Row"];
type ProductInsert = Tables["products"]["Insert"];
type ProductUpdate = Tables["products"]["Update"];

export type { Product };

type DbResultOk<T> = {
  data: T;
  error: PostgrestError | null;
};

export async function getAllProducts() {
  const { data, error }: PostgrestResponse<Product> = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch products");
  return data || [];
}

export async function addProduct(product: ProductInsert) {
  const { data, error }: PostgrestSingleResponse<Product> = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();

  if (error) throw new Error("Failed to add product");
  return data;
}

export async function updateProduct(id: number, updates: ProductUpdate) {
  const { data, error }: PostgrestSingleResponse<Product> = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Failed to update product");
  return data;
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw new Error("Failed to delete product");
}

export async function getProductsByCategory(category: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Product[];
}
