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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      lead_submissions: {
        Row: {
          company: string | null
          created_at: string
          creator_type: string | null
          email: string
          id: string
          kind: Database["public"]["Enums"]["lead_kind"]
          locale: string
          message: string | null
          name: string
          profiles: string | null
          status: Database["public"]["Enums"]["lead_status"]
          subject: string | null
          whatsapp: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          creator_type?: string | null
          email: string
          id?: string
          kind: Database["public"]["Enums"]["lead_kind"]
          locale?: string
          message?: string | null
          name: string
          profiles?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          subject?: string | null
          whatsapp?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          creator_type?: string | null
          email?: string
          id?: string
          kind?: Database["public"]["Enums"]["lead_kind"]
          locale?: string
          message?: string | null
          name?: string
          profiles?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          subject?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          created_at: string
          current_metrics: Json
          external_account_id: string | null
          handle: string | null
          id: string
          last_sync_error: string | null
          last_synced_at: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          profile_url: string | null
          sync_enabled: boolean
          talent_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_metrics?: Json
          external_account_id?: string | null
          handle?: string | null
          id?: string
          last_sync_error?: string | null
          last_synced_at?: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          profile_url?: string | null
          sync_enabled?: boolean
          talent_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_metrics?: Json
          external_account_id?: string | null
          handle?: string | null
          id?: string
          last_sync_error?: string | null
          last_synced_at?: string | null
          platform?: Database["public"]["Enums"]["social_platform"]
          profile_url?: string | null
          sync_enabled?: boolean
          talent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "talents"
            referencedColumns: ["id"]
          },
        ]
      }
      social_metric_snapshots: {
        Row: {
          captured_at: string
          connection_id: string
          id: number
          metrics: Json
        }
        Insert: {
          captured_at?: string
          connection_id: string
          id?: number
          metrics: Json
        }
        Update: {
          captured_at?: string
          connection_id?: string
          id?: number
          metrics?: Json
        }
        Relationships: [
          {
            foreignKeyName: "social_metric_snapshots_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "social_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      talents: {
        Row: {
          achievements: string | null
          analytics: Json | null
          audience: string | null
          avg_views: string | null
          bio: string | null
          category: string
          city: string | null
          contact_email: string | null
          created_at: string
          engagement: string | null
          followers: string | null
          id: string
          image_url: string | null
          instagram_url: string | null
          media_kit_url: string | null
          slug: string
          sort_order: number
          stage_name: string
          status: Database["public"]["Enums"]["publish_status"]
          tiktok_url: string | null
          twitch_url: string | null
          twitter_url: string | null
          updated_at: string
          username: string | null
          youtube_url: string | null
        }
        Insert: {
          achievements?: string | null
          analytics?: Json | null
          audience?: string | null
          avg_views?: string | null
          bio?: string | null
          category?: string
          city?: string | null
          contact_email?: string | null
          created_at?: string
          engagement?: string | null
          followers?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          media_kit_url?: string | null
          slug: string
          sort_order?: number
          stage_name: string
          status?: Database["public"]["Enums"]["publish_status"]
          tiktok_url?: string | null
          twitch_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          username?: string | null
          youtube_url?: string | null
        }
        Update: {
          achievements?: string | null
          analytics?: Json | null
          audience?: string | null
          avg_views?: string | null
          bio?: string | null
          category?: string
          city?: string | null
          contact_email?: string | null
          created_at?: string
          engagement?: string | null
          followers?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          media_kit_url?: string | null
          slug?: string
          sort_order?: number
          stage_name?: string
          status?: Database["public"]["Enums"]["publish_status"]
          tiktok_url?: string | null
          twitch_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          username?: string | null
          youtube_url?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      lead_kind: "brand" | "creator"
      lead_status: "new" | "contacted" | "archived"
      publish_status: "draft" | "published" | "hidden"
      social_platform: "youtube" | "instagram" | "tiktok" | "twitch" | "twitter"
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
      app_role: ["admin", "editor", "user"],
      lead_kind: ["brand", "creator"],
      lead_status: ["new", "contacted", "archived"],
      publish_status: ["draft", "published", "hidden"],
      social_platform: ["youtube", "instagram", "tiktok", "twitch", "twitter"],
    },
  },
} as const
