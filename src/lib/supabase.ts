import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          total_requests: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          total_requests?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          total_requests?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          key_name: string;
          api_key: string;
          key_prefix: string;
          is_active: boolean;
          last_used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          key_name: string;
          api_key: string;
          key_prefix: string;
          is_active?: boolean;
          last_used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          key_name?: string;
          api_key?: string;
          key_prefix?: string;
          is_active?: boolean;
          last_used_at?: string | null;
          created_at?: string;
        };
      };
      api_requests: {
        Row: {
          id: string;
          user_id: string;
          api_key_id: string | null;
          target_url: string;
          method: string;
          request_data: Json;
          response_data: Json;
          status_code: number | null;
          duration_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          api_key_id?: string | null;
          target_url: string;
          method?: string;
          request_data?: Json;
          response_data?: Json;
          status_code?: number | null;
          duration_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          api_key_id?: string | null;
          target_url?: string;
          method?: string;
          request_data?: Json;
          response_data?: Json;
          status_code?: number | null;
          duration_ms?: number | null;
          created_at?: string;
        };
      };
    };
  };
}
