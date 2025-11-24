import { supabase } from '@/lib/supabase';
import Banner from '@/components/tienda/Banner';
import CategoryList from '@/components/tienda/CategoryList';
import ProductGrid from '@/components/tienda/ProductGrid';

export const revalidate = 60;

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
    <main className="p-4 max-w-7xl mx-auto">
      {/* Banner - Centrado en desktop */}
      <div className="max-w-4xl mx-auto">
        <Banner />
      </div>

      {/* Categorías */}
      <div className="mb-5">
        <h3 className="font-bold text-gray-800 mb-3 text-lg">Categorías</h3>
        <CategoryList categorias={categorias} horizontal />
      </div>

      {/* Productos - Grid responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ofertas.length > 0 && (
          <div>
            <ProductGrid 
              productos={ofertas.slice(0, 4)} 
              titulo="🔥 Ofertas" 
              verTodo="/ofertas"
            />
          </div>
        )}

        {populares.length > 0 && (
          <div>
            <ProductGrid 
              productos={populares} 
              titulo="⭐ Populares" 
            />
          </div>
        )}
      </div>

      {nuevos.length > 0 && (
        <div className="mt-5">
          <ProductGrid 
            productos={nuevos} 
            titulo="✨ Lo nuevo" 
          />
        </div>
      )}
    </main>
  );
}