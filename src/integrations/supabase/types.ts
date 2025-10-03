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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          customer_id: string
          full_name: string
          id: string
          is_default: boolean | null
          phone_number: string
          postal_code: string
          state: string
          updated_at: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country?: string
          created_at?: string
          customer_id: string
          full_name: string
          id?: string
          is_default?: boolean | null
          phone_number: string
          postal_code: string
          state: string
          updated_at?: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          customer_id?: string
          full_name?: string
          id?: string
          is_default?: boolean | null
          phone_number?: string
          postal_code?: string
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          created_at: string
          id: string
          keep_logs: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          keep_logs?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          keep_logs?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          color_id: string
          created_at: string
          customer_id: string
          id: string
          product_id: string
          quantity: number
          size_id: string
          updated_at: string
        }
        Insert: {
          color_id: string
          created_at?: string
          customer_id: string
          id?: string
          product_id: string
          quantity?: number
          size_id: string
          updated_at?: string
        }
        Update: {
          color_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          product_id?: string
          quantity?: number
          size_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "product_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_list_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "product_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          image: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string
          id: string
          last_name: string
          mobile_number: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          last_name: string
          mobile_number: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_name?: string
          mobile_number?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          created_at: string
          delivery_charge: number
          delivery_days_max: number
          delivery_days_min: number
          description: string | null
          id: string
          is_active: boolean
          updated_at: string
          zone_name: string
          zone_number: number
        }
        Insert: {
          created_at?: string
          delivery_charge?: number
          delivery_days_max: number
          delivery_days_min: number
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          zone_name: string
          zone_number: number
        }
        Update: {
          created_at?: string
          delivery_charge?: number
          delivery_days_max?: number
          delivery_days_min?: number
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          zone_name?: string
          zone_number?: number
        }
        Relationships: []
      }
      flash_sale_products: {
        Row: {
          created_at: string
          flash_sale_id: string
          id: string
          product_id: string
          sale_price: number
        }
        Insert: {
          created_at?: string
          flash_sale_id: string
          id?: string
          product_id: string
          sale_price: number
        }
        Update: {
          created_at?: string
          flash_sale_id?: string
          id?: string
          product_id?: string
          sale_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "flash_sale_products_flash_sale_id_fkey"
            columns: ["flash_sale_id"]
            isOneToOne: false
            referencedRelation: "flash_sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flash_sale_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_list_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flash_sale_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_sales: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage: number
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      frontend_logs: {
        Row: {
          created_at: string
          header_data: Json | null
          id: string
          request_type: string
          requested_datetime: string
          requested_url: string
          response_status: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          header_data?: Json | null
          id?: string
          request_type: string
          requested_datetime?: string
          requested_url: string
          response_status?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          header_data?: Json | null
          id?: string
          request_type?: string
          requested_datetime?: string
          requested_url?: string
          response_status?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_link: string
          cta_text: string
          id: string
          image_url: string
          is_active: boolean
          order_index: number
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_link: string
          cta_text: string
          id?: string
          image_url: string
          is_active?: boolean
          order_index?: number
          subtitle: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_link?: string
          cta_text?: string
          id?: string
          image_url?: string
          is_active?: boolean
          order_index?: number
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_server_api_table: {
        Row: {
          active_or_no: boolean
          api_url: string
          created_at: string
          id: string
          order_of_procedence: number
          updated_at: string
        }
        Insert: {
          active_or_no?: boolean
          api_url?: string
          created_at?: string
          id?: string
          order_of_procedence?: number
          updated_at?: string
        }
        Update: {
          active_or_no?: boolean
          api_url?: string
          created_at?: string
          id?: string
          order_of_procedence?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color_id: string
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          size_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          color_id: string
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          size_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          color_id?: string
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          size_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "product_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_list_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "product_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          delivery_date: string | null
          delivery_partner_name: string | null
          id: string
          notes: string | null
          order_id: string
          shipment_id: string | null
          status: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          delivery_date?: string | null
          delivery_partner_name?: string | null
          id?: string
          notes?: string | null
          order_id: string
          shipment_id?: string | null
          status: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          delivery_date?: string | null
          delivery_partner_name?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          shipment_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          delivery_address_id: string
          delivery_charge: number | null
          delivery_date: string | null
          delivery_partner_name: string | null
          delivery_pincode: string | null
          delivery_zone_id: string | null
          estimated_delivery_days: number | null
          id: string
          order_number: string
          payment_method: string | null
          payment_status: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          shipment_id: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivery_address_id: string
          delivery_charge?: number | null
          delivery_date?: string | null
          delivery_partner_name?: string | null
          delivery_pincode?: string | null
          delivery_zone_id?: string | null
          estimated_delivery_days?: number | null
          id?: string
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          shipment_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivery_address_id?: string
          delivery_charge?: number | null
          delivery_date?: string | null
          delivery_partner_name?: string | null
          delivery_pincode?: string | null
          delivery_zone_id?: string | null
          estimated_delivery_days?: number | null
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          shipment_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      pincode_zones: {
        Row: {
          city: string | null
          created_at: string
          delivery_zone_id: string
          id: string
          pincode: string
          state: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          delivery_zone_id: string
          id?: string
          pincode: string
          state?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          delivery_zone_id?: string
          id?: string
          pincode?: string
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pincode_zones_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      popup_settings: {
        Row: {
          button_text: string
          created_at: string
          description: string
          display_delay: number | null
          display_frequency: string | null
          id: string
          image_url: string | null
          is_enabled: boolean
          popup_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          button_text: string
          created_at?: string
          description: string
          display_delay?: number | null
          display_frequency?: string | null
          id?: string
          image_url?: string | null
          is_enabled?: boolean
          popup_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          button_text?: string
          created_at?: string
          description?: string
          display_delay?: number | null
          display_frequency?: string | null
          id?: string
          image_url?: string | null
          is_enabled?: boolean
          popup_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_colors: {
        Row: {
          color_code: string
          id: string
          name: string
          product_id: string
        }
        Insert: {
          color_code: string
          id?: string
          name: string
          product_id: string
        }
        Update: {
          color_code?: string
          id?: string
          name?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_list_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          color_id: string
          display_order: number | null
          id: string
          image_name: string | null
          image_url: string
          is_primary: boolean | null
          media_file_name: string | null
          media_file_type: string | null
          media_server_api_url_fk: string | null
          product_id: string
        }
        Insert: {
          color_id: string
          display_order?: number | null
          id?: string
          image_name?: string | null
          image_url: string
          is_primary?: boolean | null
          media_file_name?: string | null
          media_file_type?: string | null
          media_server_api_url_fk?: string | null
          product_id: string
        }
        Update: {
          color_id?: string
          display_order?: number | null
          id?: string
          image_name?: string | null
          image_url?: string
          is_primary?: boolean | null
          media_file_name?: string | null
          media_file_type?: string | null
          media_server_api_url_fk?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "product_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_media_server_api_url_fk_fkey"
            columns: ["media_server_api_url_fk"]
            isOneToOne: false
            referencedRelation: "media_server_api_table"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_list_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sizes: {
        Row: {
          id: string
          in_stock: boolean | null
          name: string
          price_discounted: number | null
          price_original: number
          product_id: string
        }
        Insert: {
          id?: string
          in_stock?: boolean | null
          name: string
          price_discounted?: number | null
          price_original: number
          product_id: string
        }
        Update: {
          id?: string
          in_stock?: boolean | null
          name?: string
          price_discounted?: number | null
          price_original?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_list_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          age_ranges: string[] | null
          category_id: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          is_low_stock: boolean | null
          is_out_of_stock: boolean | null
          is_trending: boolean | null
          long_description: string | null
          price_discounted: number | null
          price_original: number
          short_description: string | null
          slug: string
          specifications: Json | null
          stock_quantity: number
          subcategory_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          age_ranges?: string[] | null
          category_id: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_low_stock?: boolean | null
          is_out_of_stock?: boolean | null
          is_trending?: boolean | null
          long_description?: string | null
          price_discounted?: number | null
          price_original: number
          short_description?: string | null
          slug: string
          specifications?: Json | null
          stock_quantity?: number
          subcategory_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          age_ranges?: string[] | null
          category_id?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_low_stock?: boolean | null
          is_out_of_stock?: boolean | null
          is_trending?: boolean | null
          long_description?: string | null
          price_discounted?: number | null
          price_original?: number
          short_description?: string | null
          slug?: string
          specifications?: Json | null
          stock_quantity?: number
          subcategory_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      returns: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          order_id: string
          order_item_id: string
          reason: string
          return_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          order_id: string
          order_item_id: string
          reason: string
          return_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string
          order_item_id?: string
          reason?: string
          return_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          color_id: string
          created_at: string
          customer_id: string
          id: string
          product_id: string
          size_id: string
        }
        Insert: {
          color_id: string
          created_at?: string
          customer_id: string
          id?: string
          product_id: string
          size_id: string
        }
        Update: {
          color_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          product_id?: string
          size_id?: string
        }
        Relationships: []
      }
      zone_regions: {
        Row: {
          circle_name: string | null
          created_at: string
          delivery: string | null
          delivery_zone_id: string
          district_name: string | null
          division_name: string | null
          id: string
          latitude: string | null
          longitude: string | null
          office_name: string | null
          office_type: string | null
          pincode: string | null
          region_name: string | null
          region_type: string
          state_name: string
          updated_at: string
        }
        Insert: {
          circle_name?: string | null
          created_at?: string
          delivery?: string | null
          delivery_zone_id: string
          district_name?: string | null
          division_name?: string | null
          id?: string
          latitude?: string | null
          longitude?: string | null
          office_name?: string | null
          office_type?: string | null
          pincode?: string | null
          region_name?: string | null
          region_type?: string
          state_name: string
          updated_at?: string
        }
        Update: {
          circle_name?: string | null
          created_at?: string
          delivery?: string | null
          delivery_zone_id?: string
          district_name?: string | null
          division_name?: string | null
          id?: string
          latitude?: string | null
          longitude?: string | null
          office_name?: string | null
          office_type?: string | null
          pincode?: string | null
          region_name?: string | null
          region_type?: string
          state_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_regions_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      product_list_view: {
        Row: {
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          id: string | null
          is_featured: boolean | null
          is_out_of_stock: boolean | null
          is_trending: boolean | null
          price_discounted: number | null
          price_original: number | null
          primary_image: string | null
          short_description: string | null
          slug: string | null
          stock_quantity: number | null
          subcategory_name: string | null
          subcategory_slug: string | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_orphaned_records: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_active_flash_sale_products: {
        Args: Record<PropertyKey, never>
        Returns: {
          discount_percentage: number
          flash_sale_end_date: string
          flash_sale_title: string
          original_price: number
          product_id: string
          product_slug: string
          product_title: string
          sale_price: number
        }[]
      }
      get_delivery_info_by_pincode: {
        Args: { pincode_param: string }
        Returns: {
          city: string
          delivery_charge: number
          delivery_days_max: number
          delivery_days_min: number
          state: string
          zone_id: string
          zone_name: string
          zone_number: number
        }[]
      }
      get_delivery_info_by_pincode_regions: {
        Args: { pincode_param: string }
        Returns: {
          city: string
          delivery_charge: number
          delivery_days_max: number
          delivery_days_min: number
          state: string
          zone_id: string
          zone_name: string
          zone_number: number
        }[]
      }
      get_products_paginated: {
        Args: {
          category_filter?: string
          featured_only?: boolean
          page_num?: number
          page_size?: number
          subcategory_filter?: string
          trending_only?: boolean
        }
        Returns: {
          category_name: string
          category_slug: string
          created_at: string
          id: string
          is_featured: boolean
          is_out_of_stock: boolean
          is_trending: boolean
          price_discounted: number
          price_original: number
          primary_image: string
          short_description: string
          slug: string
          stock_quantity: number
          subcategory_name: string
          subcategory_slug: string
          title: string
          total_count: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_order_status: {
        Args: {
          delivery_date_param?: string
          delivery_partner_param?: string
          new_status: string
          notes_param?: string
          order_id_param: string
          shipment_id_param?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
