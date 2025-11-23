export interface Config {
    id: string;
    nombre_tienda: string;
    whatsapp: string;
    instagram?: string;
    facebook?: string;
    logo_svg?: string;
    mensaje_wa_template: string;
    dias_ocultar_vendidos: number;
  }
  
  export interface Categoria {
    id: number;
    nombre: string;
    emoji: string;
    activa: boolean;
    orden: number;
  }
  
  export interface Subcategoria {
    id: number;
    categoria_id: number;
    nombre: string;
    tallas_default: string[];
  }
  
  export interface Variante {
    t: string; // talla
    s: number; // stock
  }
  
  export interface Producto {
    id: number;
    nombre: string;
    precio: number;
    precio_oferta?: number | null;
    fotos: string[];
    categoria_id: number;
    subcategoria_id: number;
    variantes: Variante[];
    ubicacion?: string;
    estado: 'disponible' | 'reservado' | 'vendido';
    destacado: boolean;
    clicks_whatsapp: number;
    created_at: string;
    vendido_at?: string | null;
    // Joins
    categoria?: Categoria;
    subcategoria?: Subcategoria;
  }
  
  export interface ProductoForm {
    nombre: string;
    precio: number | string;
    precio_oferta?: number | string | null;
    fotos: string[];
    categoria_id: number;
    subcategoria_id: number;
    variantes: Variante[];
    ubicacion: string;
    destacado: boolean;
  }