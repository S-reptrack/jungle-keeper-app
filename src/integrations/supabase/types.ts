export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      animal_transfers: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          reptile_id: string
          status: Database["public"]["Enums"]["transfer_status"]
          to_user_email: string
          to_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          reptile_id: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_user_email: string
          to_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          reptile_id?: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_user_email?: string
          to_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animal_transfers_reptile_id_fkey"
            columns: ["reptile_id"]
            isOneToOne: false
            referencedRelation: "reptiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bowel_records: {
        Row: {
          bowel_date: string
          consistency: string
          created_at: string
          id: string
          notes: string | null
          reptile_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bowel_date: string
          consistency?: string
          created_at?: string
          id?: string
          notes?: string | null
          reptile_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bowel_date?: string
          consistency?: string
          created_at?: string
          id?: string
          notes?: string | null
          reptile_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bowel_records_reptile_id_fkey"
            columns: ["reptile_id"]
            isOneToOne: false
            referencedRelation: "reptiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedings: {
        Row: {
          calcium: boolean
          created_at: string
          feeding_date: string
          id: string
          notes: string | null
          prey_state: string | null
          quantity: number
          reptile_id: string
          rodent_stage: string
          rodent_type: string
          rodent_weight: number | null
          updated_at: string
          user_id: string
          vitamins: boolean
        }
        Insert: {
          calcium?: boolean
          created_at?: string
          feeding_date: string
          id?: string
          notes?: string | null
          prey_state?: string | null
          quantity?: number
          reptile_id: string
          rodent_stage: string
          rodent_type: string
          rodent_weight?: number | null
          updated_at?: string
          user_id: string
          vitamins?: boolean
        }
        Update: {
          calcium?: boolean
          created_at?: string
          feeding_date?: string
          id?: string
          notes?: string | null
          prey_state?: string | null
          quantity?: number
          reptile_id?: string
          rodent_stage?: string
          rodent_type?: string
          rodent_weight?: number | null
          updated_at?: string
          user_id?: string
          vitamins?: boolean
        }
        Relationships: []
      }
      health_records: {
        Row: {
          condition: string
          created_at: string
          diagnosis_date: string
          id: string
          notes: string | null
          reptile_id: string
          resolved: boolean | null
          treatment: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          diagnosis_date: string
          id?: string
          notes?: string | null
          reptile_id: string
          resolved?: boolean | null
          treatment?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          diagnosis_date?: string
          id?: string
          notes?: string | null
          reptile_id?: string
          resolved?: boolean | null
          treatment?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          referral_code_used: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          referral_code_used?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          referral_code_used?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      referral_conversions: {
        Row: {
          created_at: string
          id: string
          referral_code_id: string
          referred_user_id: string
          referrer_user_id: string
          reward_applied: boolean
          reward_applied_at: string | null
          stripe_coupon_id: string | null
          subscription_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code_id: string
          referred_user_id: string
          referrer_user_id: string
          reward_applied?: boolean
          reward_applied_at?: string | null
          stripe_coupon_id?: string | null
          subscription_type: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code_id?: string
          referred_user_id?: string
          referrer_user_id?: string
          reward_applied?: boolean
          reward_applied_at?: string | null
          stripe_coupon_id?: string | null
          subscription_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      reproduction_observations: {
        Row: {
          action: string
          closed: boolean
          closed_at: string | null
          created_at: string
          expected_hatch_date: string | null
          fertilized_eggs: number | null
          hatched_eggs: number | null
          id: string
          incubation_days: number | null
          notes: string | null
          notification_days_before: number | null
          observation_date: string
          outcome_notes: string | null
          partner_id: string
          reptile_id: string
          slugs: number | null
          stillborn_juveniles: number | null
          unfertilized_eggs: number | null
          unhatched_eggs: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action: string
          closed?: boolean
          closed_at?: string | null
          created_at?: string
          expected_hatch_date?: string | null
          fertilized_eggs?: number | null
          hatched_eggs?: number | null
          id?: string
          incubation_days?: number | null
          notes?: string | null
          notification_days_before?: number | null
          observation_date: string
          outcome_notes?: string | null
          partner_id: string
          reptile_id: string
          slugs?: number | null
          stillborn_juveniles?: number | null
          unfertilized_eggs?: number | null
          unhatched_eggs?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string
          closed?: boolean
          closed_at?: string | null
          created_at?: string
          expected_hatch_date?: string | null
          fertilized_eggs?: number | null
          hatched_eggs?: number | null
          id?: string
          incubation_days?: number | null
          notes?: string | null
          notification_days_before?: number | null
          observation_date?: string
          outcome_notes?: string | null
          partner_id?: string
          reptile_id?: string
          slugs?: number | null
          stillborn_juveniles?: number | null
          unfertilized_eggs?: number | null
          unhatched_eggs?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reproduction_observations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "reptiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reproduction_observations_reptile_id_fkey"
            columns: ["reptile_id"]
            isOneToOne: false
            referencedRelation: "reptiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reptile_genealogy: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          parent_type: string
          reptile_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          parent_type: string
          reptile_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          parent_type?: string
          reptile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reptile_genealogy_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "reptiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reptile_genealogy_reptile_id_fkey"
            columns: ["reptile_id"]
            isOneToOne: false
            referencedRelation: "reptiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reptile_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          reptile_id: string
          taken_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          reptile_id: string
          taken_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          reptile_id?: string
          taken_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reptile_photos_reptile_id_fkey"
            columns: ["reptile_id"]
            isOneToOne: false
            referencedRelation: "reptiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reptiles: {
        Row: {
          archive_notes: string | null
          birth_date: string | null
          category: string
          created_at: string
          feeding_interval_days: number | null
          id: string
          image_url: string | null
          morphs: string[] | null
          name: string
          previous_owner_id: string | null
          purchase_date: string | null
          sale_document_url: string | null
          sex: string | null
          species: string
          status: string
          status_date: string | null
          transferred_at: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          archive_notes?: string | null
          birth_date?: string | null
          category: string
          created_at?: string
          feeding_interval_days?: number | null
          id?: string
          image_url?: string | null
          morphs?: string[] | null
          name: string
          previous_owner_id?: string | null
          purchase_date?: string | null
          sale_document_url?: string | null
          sex?: string | null
          species: string
          status?: string
          status_date?: string | null
          transferred_at?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          archive_notes?: string | null
          birth_date?: string | null
          category?: string
          created_at?: string
          feeding_interval_days?: number | null
          id?: string
          image_url?: string | null
          morphs?: string[] | null
          name?: string
          previous_owner_id?: string | null
          purchase_date?: string | null
          sale_document_url?: string | null
          sex?: string | null
          species?: string
          status?: string
          status_date?: string | null
          transferred_at?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      rodents: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          purchase_date: string | null
          quantity: number
          stage: string
          type: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date?: string | null
          quantity?: number
          stage: string
          type: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date?: string | null
          quantity?: number
          stage?: string
          type?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      shedding_records: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          quality: string
          reptile_id: string
          shedding_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          quality?: string
          reptile_id: string
          shedding_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          quality?: string
          reptile_id?: string
          shedding_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shedding_records_reptile_id_fkey"
            columns: ["reptile_id"]
            isOneToOne: false
            referencedRelation: "reptiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tester_activity: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string
          id: string
          page_url: string | null
          session_duration: number | null
          user_id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string
          id?: string
          page_url?: string | null
          session_duration?: number | null
          user_id: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string
          id?: string
          page_url?: string | null
          session_duration?: number | null
          user_id?: string
        }
        Relationships: []
      }
      tester_feedback: {
        Row: {
          category: string
          created_at: string
          feedback: string
          id: string
          page_url: string | null
          rating: number
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          feedback: string
          id?: string
          page_url?: string | null
          rating: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          feedback?: string
          id?: string
          page_url?: string | null
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      tester_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          reactivated_at: string | null
          status: string
          suspended: boolean
          suspended_at: string | null
          trial_end_date: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          reactivated_at?: string | null
          status?: string
          suspended?: boolean
          suspended_at?: string | null
          trial_end_date?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          reactivated_at?: string | null
          status?: string
          suspended?: boolean
          suspended_at?: string | null
          trial_end_date?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weight_records: {
        Row: {
          created_at: string
          id: string
          measurement_date: string
          notes: string | null
          reptile_id: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          measurement_date: string
          notes?: string | null
          reptile_id: string
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          id?: string
          measurement_date?: string
          notes?: string | null
          reptile_id?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_see_transfer_sender: {
        Args: { sender_user_id: string }
        Returns: boolean
      }
      check_email_exists: { Args: { check_email: string }; Returns: boolean }
      generate_referral_code: { Args: never; Returns: string }
      get_referral_reward_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_tester_last_activity: {
        Args: { tester_user_ids: string[] }
        Returns: {
          last_activity: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
      is_beta_tester: { Args: { check_user_id: string }; Returns: boolean }
      is_tester: { Args: { check_user_id: string }; Returns: boolean }
      is_transfer_recipient: {
        Args: { transfer_to_email: string; transfer_to_user_id: string }
        Returns: boolean
      }
      mask_email: { Args: { email: string }; Returns: string }
      remove_tester_role_on_subscribe: {
        Args: { user_email: string }
        Returns: undefined
      }
      validate_referral_code: { Args: { p_code: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user" | "tester" | "beta_tester"
      transfer_status: "pending" | "accepted" | "rejected" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "tester", "beta_tester"],
      transfer_status: ["pending", "accepted", "rejected", "cancelled"],
    },
  },
} as const
