export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          name: string;
          available: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["products"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
    };
  };
};
