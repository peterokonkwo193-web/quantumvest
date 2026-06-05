export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type KycStatus = "pending" | "approved" | "rejected";
export type ProfitType = "roi" | "manual" | "bonus" | "referral";
export type ProfitStatus = "pending" | "scheduled" | "approved" | "paid" | "cancelled";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          wallet_balance: number;
          kyc_status: KycStatus;
          kyc_reviewed_at: string | null;
          kyc_notes: string | null;
          kyc_document_url: string | null;
          kyc_id_number: string | null;
          is_suspended: boolean;
          deleted_at: string | null;
          referral_code: string | null;
          referred_by: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email: string;
          wallet_balance?: number;
          kyc_status?: KycStatus;
          kyc_reviewed_at?: string | null;
          kyc_notes?: string | null;
          kyc_document_url?: string | null;
          kyc_id_number?: string | null;
          is_suspended?: boolean;
          deleted_at?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          email?: string;
          wallet_balance?: number;
          kyc_status?: KycStatus;
          kyc_reviewed_at?: string | null;
          kyc_notes?: string | null;
          kyc_document_url?: string | null;
          kyc_id_number?: string | null;
          is_suspended?: boolean;
          deleted_at?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          permissions: Json;
          last_active_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          permissions?: Json;
          last_active_at?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          permissions?: Json;
          last_active_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profits: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string | null;
          investment_id: string | null;
          profit_type: ProfitType;
          amount: number;
          profit_percentage: number | null;
          description: string | null;
          payout_date: string | null;
          status: ProfitStatus;
          issued_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id?: string | null;
          investment_id?: string | null;
          profit_type?: ProfitType;
          amount: number;
          profit_percentage?: number | null;
          description?: string | null;
          payout_date?: string | null;
          status?: ProfitStatus;
          issued_by?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          plan_id?: string | null;
          investment_id?: string | null;
          profit_type?: ProfitType;
          amount?: number;
          profit_percentage?: number | null;
          description?: string | null;
          payout_date?: string | null;
          status?: ProfitStatus;
          issued_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      investment_plans: {
        Row: {
          id: string;
          plan_name: string;
          min_deposit: number;
          max_deposit: number | null;
          roi: number;
          duration: number;
          features: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_name: string;
          min_deposit: number;
          max_deposit?: number | null;
          roi: number;
          duration: number;
          features?: string[];
          created_at?: string;
        };
        Update: {
          plan_name?: string;
          min_deposit?: number;
          max_deposit?: number | null;
          roi?: number;
          duration?: number;
          features?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      user_investments: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          amount: number;
          expected_profit: number;
          status: "active" | "completed" | "cancelled";
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          amount: number;
          expected_profit: number;
          status?: "active" | "completed" | "cancelled";
          start_date?: string;
          end_date: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          plan_id?: string;
          amount?: number;
          expected_profit?: number;
          status?: "active" | "completed" | "cancelled";
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          transaction_type: "deposit" | "withdrawal" | "investment" | "profit";
          status: "pending" | "completed" | "failed";
          reference_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          transaction_type: "deposit" | "withdrawal" | "investment" | "profit";
          status?: "pending" | "completed" | "failed";
          reference_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          amount?: number;
          transaction_type?: "deposit" | "withdrawal" | "investment" | "profit";
          status?: "pending" | "completed" | "failed";
          reference_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      withdrawals: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          wallet_address: string;
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          wallet_address: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Update: {
          user_id?: string;
          amount?: number;
          wallet_address?: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      calculate_roi_profit: {
        Args: { p_amount: number; p_roi_percent: number };
        Returns: number;
      };
      approve_deposit: {
        Args: { p_transaction_id: string; p_admin_id: string };
        Returns: undefined;
      };
      approve_withdrawal: {
        Args: { p_withdrawal_id: string; p_admin_id: string };
        Returns: undefined;
      };
      reject_withdrawal: {
        Args: { p_withdrawal_id: string; p_admin_id: string };
        Returns: undefined;
      };
      distribute_profit: {
        Args: { p_profit_id: string; p_admin_id: string };
        Returns: undefined;
      };
      suspend_user: {
        Args: { p_target_user_id: string; p_suspend: boolean };
        Returns: undefined;
      };
      soft_delete_user: {
        Args: { p_target_user_id: string; p_admin_id: string };
        Returns: undefined;
      };
      update_kyc_status: {
        Args: { p_user_id: string; p_status: string; p_notes?: string };
        Returns: undefined;
      };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
