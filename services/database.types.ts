export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      houses: {
        Row: {
          id: string;
          created_at: string;
          house_number: string;
          owner_name: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          house_number: string;
          owner_name: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          house_number?: string;
          owner_name?: string;
        };
        Relationships: [];
      };
      meter_readings: {
        Row: {
          id: string;
          created_at: string;
          house_id: string;
          month_key: string;
          month: string;
          previous_reading: number;
          current_reading: number;
          units_used: number;
          rate_per_unit: number;
          total_amount: number;
          date_recorded: string;
          meter_image: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          house_id: string;
          month_key: string;
          month: string;
          previous_reading: number;
          current_reading: number;
          units_used: number;
          rate_per_unit: number;
          total_amount: number;
          date_recorded: string;
          meter_image?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          house_id?: string;
          month_key?: string;
          month?: string;
          previous_reading?: number;
          current_reading?: number;
          units_used?: number;
          rate_per_unit?: number;
          total_amount?: number;
          date_recorded?: string;
          meter_image?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "meter_readings_house_id_fkey";
            columns: ["house_id"];
            isOneToOne: false;
            referencedRelation: "houses";
            referencedColumns: ["id"];
          },
        ];
      };
      water_unit_rates: {
        Row: {
          id: string;
          created_at: string;
          rate_per_unit: number;
          effective_from: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          rate_per_unit: number;
          effective_from?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          rate_per_unit?: number;
          effective_from?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
