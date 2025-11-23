// Este archivo representa la estructura de las tablas que creamos en Supabase.
// Es crucial para que TypeScript nos ayude a evitar errores de escritura.

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
      categorias: {
        Row: { // La estructura que viene de la base de datos
          activa: boolean | null
          created_at: string | null
          emoji: string | null
          id: number
          nombre: string
          orden: number | null
        }
        Insert: { // Lo que insertamos
          activa?: boolean | null
          created_at?: string | null
          emoji?: string | null
          id?: number
          nombre: string
          orden?: number | null
        }
        Update: { // Lo que actualizamos
          activa?: boolean | null
          created_at?: string | null
          emoji?: string | null
          id?: number
          nombre?: string
          orden?: number | null
        }
        Relationships: []
      }
      config: {
        Row: {
          created_at: string | null
          dias_ocultar_vendidos: number | null
          facebook: string | null
          id: string
          instagram: string | null
          logo_svg: string | null
          mensaje_wa_template: string | null
          nombre_tienda: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string | null
          dias_ocultar_vendidos?: number | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_svg?: string | null
          mensaje_wa_template?: string | null
          nombre_tienda?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string | null
          dias_ocultar_vendidos?: number | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_svg?: string | null
          mensaje_wa_template?: string | null
          nombre_tienda?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      productos: {
        Row: {
          clicks_whatsapp: number | null
          created_at: string | null
          vendido_at: string | null
          updated_at: string | null
          categoria_id: number | null
          destacado: boolean | null
          estado: Database["public"]["Enums"]["estado_producto"] | null
          fotos: string[] | null
          id: number
          nombre: string
          precio: number
          precio_oferta: number | null
          subcategoria_id: number | null
          ubicacion: string | null
          variantes: Json | null
        }
        Insert: {
          clicks_whatsapp?: number | null
          created_at?: string | null
          vendido_at?: string | null
          updated_at?: string | null
          categoria_id?: number | null
          destacado?: boolean | null
          estado?: Database["public"]["Enums"]["estado_producto"] | null
          fotos?: string[] | null
          id?: number
          nombre: string
          precio: number
          precio_oferta?: number | null
          subcategoria_id?: number | null
          ubicacion?: string | null
          variantes?: Json | null
        }
        Update: {
          clicks_whatsapp?: number | null
          created_at?: string | null
          vendido_at?: string | null
          updated_at?: string | null
          categoria_id?: number | null
          destacado?: boolean | null
          estado?: Database["public"]["Enums"]["estado_producto"] | null
          fotos?: string[] | null
          id?: number
          nombre?: string
          precio?: number
          precio_oferta?: number | null
          subcategoria_id?: number | null
          ubicacion?: string | null
          variantes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_subcategoria_id_fkey"
            columns: ["subcategoria_id"]
            referencedRelation: "subcategorias"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategorias: {
        Row: {
          categoria_id: number | null
          created_at: string | null
          id: number
          nombre: string
          tallas_default: string[] | null
        }
        Insert: {
          categoria_id?: number | null
          created_at?: string | null
          id?: number
          nombre: string
          tallas_default?: string[] | null
        }
        Update: {
          categoria_id?: number | null
          created_at?: string | null
          id?: number
          nombre?: string
          tallas_default?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategorias_categoria_id_fkey"
            columns: ["categoria_id"]
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: Record<PropertyKey, never>
      }
    }
    Enums: {
      estado_producto: "disponible" | "reservado" | "vendido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}