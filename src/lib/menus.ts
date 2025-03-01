import { supabase } from "./supabase";
import { type Database } from "../types/supabase";
import {
  type PostgrestError,
  type PostgrestSingleResponse,
  type PostgrestResponse,
} from "@supabase/supabase-js";

type Tables = Database["public"]["Tables"];
type Menu = Tables["menus"]["Row"];

export async function getLatestMenu() {
  const { data, error }: PostgrestSingleResponse<Menu> = await supabase
    .from("menus")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No menu found
      return null;
    }
    throw new Error("Failed to fetch latest menu");
  }

  return data;
}

export async function updateMenu(
  id: number,
  content: string,
): Promise<Menu | null> {
  const { data, error }: PostgrestSingleResponse<Menu> = await supabase
    .from("menus")
    .update({ content })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating menu:", error);
    throw new Error("Failed to update menu");
  }

  return data;
}
