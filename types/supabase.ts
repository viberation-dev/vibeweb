// Generated from the live Viberation schema (migrations 01-11).
//
// Produced by Supabase's own type generator, not the old scripts/gen-types.mjs
// stopgap. Regenerate with the Supabase CLI:
//   supabase gen types typescript --project-id <ref> > types/supabase.ts
// or via the Supabase MCP server's generate_typescript_types tool.
//
// Do not hand-edit: the next regeneration overwrites the file.

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
      bookmarks: {
        Row: {
          created_at: string
          folder_name: string | null
          id: string
          target_id: string
          target_type: Database["public"]["Enums"]["target_kind"]
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_name?: string | null
          id?: string
          target_id: string
          target_type: Database["public"]["Enums"]["target_kind"]
          user_id: string
        }
        Update: {
          created_at?: string
          folder_name?: string | null
          id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["target_kind"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          collection_id: string
          id: string
          sort_order: number
          target_id: string
          target_type: Database["public"]["Enums"]["target_kind"]
        }
        Insert: {
          collection_id: string
          id?: string
          sort_order?: number
          target_id: string
          target_type: Database["public"]["Enums"]["target_kind"]
        }
        Update: {
          collection_id?: string
          id?: string
          sort_order?: number
          target_id?: string
          target_type?: Database["public"]["Enums"]["target_kind"]
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          is_featured: boolean
          search_vector: unknown
          slug: string
          title: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          search_vector?: unknown
          slug: string
          title: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          search_vector?: unknown
          slug?: string
          title?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          audience: Database["public"]["Enums"]["docs_audience"] | null
          body: string | null
          created_at: string
          id: string
          role_level: Database["public"]["Enums"]["role_level"] | null
          search_vector: unknown
          slug: string
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["docs_audience"] | null
          body?: string | null
          created_at?: string
          id?: string
          role_level?: Database["public"]["Enums"]["role_level"] | null
          search_vector?: unknown
          slug: string
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at?: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["docs_audience"] | null
          body?: string | null
          created_at?: string
          id?: string
          role_level?: Database["public"]["Enums"]["role_level"] | null
          search_vector?: unknown
          slug?: string
          title?: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string
        }
        Relationships: []
      }
      content_tags: {
        Row: {
          content_id: string
          tag_id: string
        }
        Insert: {
          content_id: string
          tag_id: string
        }
        Update: {
          content_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_tags_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      history_items: {
        Row: {
          id: string
          target_id: string
          target_type: Database["public"]["Enums"]["target_kind"]
          user_id: string
          visited_at: string
        }
        Insert: {
          id?: string
          target_id: string
          target_type: Database["public"]["Enums"]["target_kind"]
          user_id: string
          visited_at?: string
        }
        Update: {
          id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["target_kind"]
          user_id?: string
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "history_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          app_role: Database["public"]["Enums"]["app_role"]
          created_at: string
          email: string | null
          id: string
          layout_mode: Database["public"]["Enums"]["layout_mode"]
          onboarding_completed: boolean
          plan: Database["public"]["Enums"]["user_plan"]
          role_level: Database["public"]["Enums"]["role_level"]
          updated_at: string
          username: string | null
        }
        Insert: {
          app_role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          email?: string | null
          id: string
          layout_mode?: Database["public"]["Enums"]["layout_mode"]
          onboarding_completed?: boolean
          plan?: Database["public"]["Enums"]["user_plan"]
          role_level?: Database["public"]["Enums"]["role_level"]
          updated_at?: string
          username?: string | null
        }
        Update: {
          app_role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          email?: string | null
          id?: string
          layout_mode?: Database["public"]["Enums"]["layout_mode"]
          onboarding_completed?: boolean
          plan?: Database["public"]["Enums"]["user_plan"]
          role_level?: Database["public"]["Enums"]["role_level"]
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      prompt_tags: {
        Row: {
          prompt_id: string
          tag_id: string
        }
        Insert: {
          prompt_id: string
          tag_id: string
        }
        Update: {
          prompt_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_tags_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          created_at: string
          id: string
          prompt_text: string
          title: string
          tool_id: string | null
          use_case_category: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_text: string
          title: string
          tool_id?: string | null
          use_case_category?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          prompt_text?: string
          title?: string
          tool_id?: string | null
          use_case_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      tool_tags: {
        Row: {
          tag_id: string
          tool_id: string
        }
        Insert: {
          tag_id: string
          tool_id: string
        }
        Update: {
          tag_id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_tags_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          bookmark_count: number
          category: Database["public"]["Enums"]["tool_category"]
          comparison_ready: boolean
          created_at: string
          description: string | null
          id: string
          is_affiliate: boolean
          name: string
          outbound_url: string
          pricing_tier: string | null
          search_vector: unknown
          slug: string
          tagline: string | null
          updated_at: string
          view_count: number
        }
        Insert: {
          bookmark_count?: number
          category: Database["public"]["Enums"]["tool_category"]
          comparison_ready?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_affiliate?: boolean
          name: string
          outbound_url?: string
          pricing_tier?: string | null
          search_vector?: unknown
          slug: string
          tagline?: string | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          bookmark_count?: number
          category?: Database["public"]["Enums"]["tool_category"]
          comparison_ready?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_affiliate?: boolean
          name?: string
          outbound_url?: string
          pricing_tier?: string | null
          search_vector?: unknown
          slug?: string
          tagline?: string | null
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      wizard_progress: {
        Row: {
          checklist_state: Json
          id: string
          step_index: number
          updated_at: string
          user_id: string
          wizard_id: string
        }
        Insert: {
          checklist_state?: Json
          id?: string
          step_index?: number
          updated_at?: string
          user_id: string
          wizard_id: string
        }
        Update: {
          checklist_state?: Json
          id?: string
          step_index?: number
          updated_at?: string
          user_id?: string
          wizard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wizard_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wizard_progress_wizard_id_fkey"
            columns: ["wizard_id"]
            isOneToOne: false
            referencedRelation: "wizards"
            referencedColumns: ["id"]
          },
        ]
      }
      wizard_recommended_tools: {
        Row: {
          tool_id: string
          wizard_id: string
        }
        Insert: {
          tool_id: string
          wizard_id: string
        }
        Update: {
          tool_id?: string
          wizard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wizard_recommended_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wizard_recommended_tools_wizard_id_fkey"
            columns: ["wizard_id"]
            isOneToOne: false
            referencedRelation: "wizards"
            referencedColumns: ["id"]
          },
        ]
      }
      wizards: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["wizard_kind"]
          reusable: boolean
          role_level: Database["public"]["Enums"]["role_level"] | null
          slug: string
          status: Database["public"]["Enums"]["wizard_status"]
          steps: Json
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["wizard_kind"]
          reusable?: boolean
          role_level?: Database["public"]["Enums"]["role_level"] | null
          slug: string
          status?: Database["public"]["Enums"]["wizard_status"]
          steps?: Json
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["wizard_kind"]
          reusable?: boolean
          role_level?: Database["public"]["Enums"]["role_level"] | null
          slug?: string
          status?: Database["public"]["Enums"]["wizard_status"]
          steps?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_tool_views: { Args: { tool_slug: string }; Returns: undefined }
      is_staff: { Args: never; Returns: boolean }
      search_all: {
        Args: { q: string; result_limit?: number }
        Returns: {
          id: string
          kind: string
          rank: number
        }[]
      }
    }
    Enums: {
      app_role: "member" | "admin" | "super_admin"
      content_type:
        | "article"
        | "guide"
        | "cheatsheet"
        | "course_link"
        | "help_article"
        | "role_guide"
      docs_audience: "enduser" | "author" | "admin" | "seller"
      layout_mode: "essentials" | "advanced"
      role_level: "beginner" | "intermediate" | "expert"
      target_kind: "tool" | "content" | "prompt" | "collection" | "wizard"
      tool_category:
        | "models"
        | "agents"
        | "chats"
        | "skills"
        | "mcp_servers"
        | "plugins"
        | "frameworks"
        | "clis"
        | "ides"
        | "tools"
        | "utilities"
        | "templates"
        | "workflows"
      user_plan: "free" | "pro"
      wizard_kind: "wizard" | "setup" | "path"
      wizard_status: "draft" | "published"
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
      app_role: ["member", "admin", "super_admin"],
      content_type: [
        "article",
        "guide",
        "cheatsheet",
        "course_link",
        "help_article",
        "role_guide",
      ],
      docs_audience: ["enduser", "author", "admin", "seller"],
      layout_mode: ["essentials", "advanced"],
      role_level: ["beginner", "intermediate", "expert"],
      target_kind: ["tool", "content", "prompt", "collection", "wizard"],
      tool_category: [
        "models",
        "agents",
        "chats",
        "skills",
        "mcp_servers",
        "plugins",
        "frameworks",
        "clis",
        "ides",
        "tools",
        "utilities",
        "templates",
        "workflows",
      ],
      user_plan: ["free", "pro"],
      wizard_kind: ["wizard", "setup", "path"],
      wizard_status: ["draft", "published"],
    },
  },
} as const
