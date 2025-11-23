import { supabase } from '@/lib/supabase';
import Banner from '@/components/tienda/Banner';
import CategoryList from '@/components/tienda/CategoryList';
import ProductGrid from '@/components/tienda/ProductGrid';

export const revalidate = 60; // Revalidar cada 60 segundos

async function getData() {
  const [categoriasRes, productosRes] = await Promise.all([
    supabase
      .from('categorias')
      .select('*')
      .eq('activa', true)
      .order('orden'),
    supabase
      .from('productos')
      .select('*')
      .eq('estado', 'disponible')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  return {
    categorias: categoriasRes.data || [],
    productos: productosRes.data || [],
  };
}

export default async function HomePage() {
  const { categorias, productos } = await getData();
  
  const ofertas = productos.filter((p) => p.precio_oferta !== null);
  const populares = [...productos]
    .sort((a, b) => b.clicks_whatsapp - a.clicks_whatsapp)
    .slice(0, 4);
  const nuevos = productos.slice(0, 4);

  return (
    <main className="p-4">
      {/* CAMBIO IMPORTANTE: Banner sin props para que use la configuración dinámica */}
      <Banner />

      <div className="mb-5">
        <h3 className="font-bold text-gray-800 mb-3">Categorías</h3>
        <CategoryList categorias={categorias} horizontal />
      </div>

      {ofertas.length > 0 && (
        <ProductGrid 
          productos={ofertas.slice(0, 4)} 
          titulo="🔥 Ofertas" 
          verTodo="/ofertas"
        />
      )}

      {populares.length > 0 && (
        <ProductGrid 
          productos={populares} 
          titulo="⭐ Populares" 
        />
      )}

      {nuevos.length > 0 && (
        <ProductGrid 
          productos={nuevos} 
          titulo="✨ Lo nuevo" 
        />
      )}
    </main>
  );
}