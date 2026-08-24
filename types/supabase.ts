// Generated from the live Viberation schema (migrations 01-06).
// Regenerate with: npm run gen:types

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
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          target_type: Database["public"]["Enums"]["target_kind"];
          target_id: string;
          folder_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type: Database["public"]["Enums"]["target_kind"];
          target_id: string;
          folder_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          target_type?: Database["public"]["Enums"]["target_kind"];
          target_id?: string;
          folder_name?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      collection_items: {
        Row: {
          id: string;
          collection_id: string;
          target_type: Database["public"]["Enums"]["target_kind"];
          target_id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          collection_id: string;
          target_type: Database["public"]["Enums"]["target_kind"];
          target_id: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          collection_id?: string;
          target_type?: Database["public"]["Enums"]["target_kind"];
          target_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
        ];
      };
      collections: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_image: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_image?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          cover_image?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      content: {
        Row: {
          id: string;
          type: Database["public"]["Enums"]["content_type"];
          title: string;
          slug: string;
          body: string | null;
          role_level: Database["public"]["Enums"]["role_level"] | null;
          audience: Database["public"]["Enums"]["docs_audience"] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: Database["public"]["Enums"]["content_type"];
          title: string;
          slug: string;
          body?: string | null;
          role_level?: Database["public"]["Enums"]["role_level"] | null;
          audience?: Database["public"]["Enums"]["docs_audience"] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: Database["public"]["Enums"]["content_type"];
          title?: string;
          slug?: string;
          body?: string | null;
          role_level?: Database["public"]["Enums"]["role_level"] | null;
          audience?: Database["public"]["Enums"]["docs_audience"] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_tags: {
        Row: {
          content_id: string;
          tag_id: string;
        };
        Insert: {
          content_id: string;
          tag_id: string;
        };
        Update: {
          content_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_tags_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "content";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "content_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      history_items: {
        Row: {
          id: string;
          user_id: string;
          target_type: Database["public"]["Enums"]["target_kind"];
          target_id: string;
          visited_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type: Database["public"]["Enums"]["target_kind"];
          target_id: string;
          visited_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          target_type?: Database["public"]["Enums"]["target_kind"];
          target_id?: string;
          visited_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "history_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          username: string | null;
          plan: Database["public"]["Enums"]["user_plan"];
          role_level: Database["public"]["Enums"]["role_level"];
          app_role: Database["public"]["Enums"]["app_role"];
          layout_mode: Database["public"]["Enums"]["layout_mode"];
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          username?: string | null;
          plan?: Database["public"]["Enums"]["user_plan"];
          role_level?: Database["public"]["Enums"]["role_level"];
          app_role?: Database["public"]["Enums"]["app_role"];
          layout_mode?: Database["public"]["Enums"]["layout_mode"];
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          username?: string | null;
          plan?: Database["public"]["Enums"]["user_plan"];
          role_level?: Database["public"]["Enums"]["role_level"];
          app_role?: Database["public"]["Enums"]["app_role"];
          layout_mode?: Database["public"]["Enums"]["layout_mode"];
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      prompt_tags: {
        Row: {
          prompt_id: string;
          tag_id: string;
        };
        Insert: {
          prompt_id: string;
          tag_id: string;
        };
        Update: {
          prompt_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_tags_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prompt_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      prompts: {
        Row: {
          id: string;
          title: string;
          prompt_text: string;
          tool_id: string | null;
          use_case_category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          prompt_text: string;
          tool_id?: string | null;
          use_case_category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          prompt_text?: string;
          tool_id?: string | null;
          use_case_category?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompts_tool_id_fkey";
            columns: ["tool_id"];
            isOneToOne: false;
            referencedRelation: "tools";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      tool_tags: {
        Row: {
          tool_id: string;
          tag_id: string;
        };
        Insert: {
          tool_id: string;
          tag_id: string;
        };
        Update: {
          tool_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tool_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tool_tags_tool_id_fkey";
            columns: ["tool_id"];
            isOneToOne: false;
            referencedRelation: "tools";
            referencedColumns: ["id"];
          },
        ];
      };
      tools: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: Database["public"]["Enums"]["tool_category"];
          tagline: string | null;
          description: string | null;
          pricing_tier: string | null;
          view_count: number;
          bookmark_count: number;
          comparison_ready: boolean;
          created_at: string;
          updated_at: string;
          outbound_url: string;
          is_affiliate: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: Database["public"]["Enums"]["tool_category"];
          tagline?: string | null;
          description?: string | null;
          pricing_tier?: string | null;
          view_count?: number;
          bookmark_count?: number;
          comparison_ready?: boolean;
          created_at?: string;
          updated_at?: string;
          outbound_url?: string;
          is_affiliate?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: Database["public"]["Enums"]["tool_category"];
          tagline?: string | null;
          description?: string | null;
          pricing_tier?: string | null;
          view_count?: number;
          bookmark_count?: number;
          comparison_ready?: boolean;
          created_at?: string;
          updated_at?: string;
          outbound_url?: string;
          is_affiliate?: boolean;
        };
        Relationships: [];
      };
      wizard_progress: {
        Row: {
          id: string;
          user_id: string;
          wizard_id: string;
          step_index: number;
          checklist_state: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wizard_id: string;
          step_index?: number;
          checklist_state?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wizard_id?: string;
          step_index?: number;
          checklist_state?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wizard_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wizard_progress_wizard_id_fkey";
            columns: ["wizard_id"];
            isOneToOne: false;
            referencedRelation: "wizards";
            referencedColumns: ["id"];
          },
        ];
      };
      wizard_recommended_tools: {
        Row: {
          wizard_id: string;
          tool_id: string;
        };
        Insert: {
          wizard_id: string;
          tool_id: string;
        };
        Update: {
          wizard_id?: string;
          tool_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wizard_recommended_tools_tool_id_fkey";
            columns: ["tool_id"];
            isOneToOne: false;
            referencedRelation: "tools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wizard_recommended_tools_wizard_id_fkey";
            columns: ["wizard_id"];
            isOneToOne: false;
            referencedRelation: "wizards";
            referencedColumns: ["id"];
          },
        ];
      };
      wizards: {
        Row: {
          id: string;
          title: string;
          slug: string;
          kind: Database["public"]["Enums"]["wizard_kind"];
          reusable: boolean;
          steps: Json;
          role_level: Database["public"]["Enums"]["role_level"] | null;
          status: Database["public"]["Enums"]["wizard_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          kind?: Database["public"]["Enums"]["wizard_kind"];
          reusable?: boolean;
          steps?: Json;
          role_level?: Database["public"]["Enums"]["role_level"] | null;
          status?: Database["public"]["Enums"]["wizard_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          kind?: Database["public"]["Enums"]["wizard_kind"];
          reusable?: boolean;
          steps?: Json;
          role_level?: Database["public"]["Enums"]["role_level"] | null;
          status?: Database["public"]["Enums"]["wizard_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      app_role: "member" | "admin" | "super_admin";
      content_type: "article" | "guide" | "cheatsheet" | "course_link" | "help_article" | "role_guide";
      docs_audience: "enduser" | "author" | "admin" | "seller";
      layout_mode: "essentials" | "advanced";
      role_level: "beginner" | "intermediate" | "expert";
      target_kind: "tool" | "content" | "prompt" | "collection" | "wizard";
      tool_category: "models" | "agents" | "chats" | "skills" | "mcp_servers" | "plugins" | "frameworks" | "clis" | "ides" | "tools" | "utilities" | "templates" | "workflows";
      user_plan: "free" | "pro";
      wizard_kind: "wizard" | "setup" | "path";
      wizard_status: "draft" | "published";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
