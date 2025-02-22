export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          name: string;
          available: boolean;
          order: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["products"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      menus: {
        Row: {
          id: number;
          content: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["menus"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["menus"]["Row"]>;
      };
    };
  };
};
