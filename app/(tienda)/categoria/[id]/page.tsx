import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ProductCard from '@/components/tienda/ProductCard';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sub?: string; orden?: string }>;
}

async function getData(categoriaId: number) {
  const [categoriaRes, subcategoriasRes, productosRes] = await Promise.all([
    supabase.from('categorias').select('*').eq('id', categoriaId).single(),
    supabase.from('subcategorias').select('*').eq('categoria_id', categoriaId),
    supabase
      .from('productos')
      .select('*')
      .eq('categoria_id', categoriaId)
      .neq('estado', 'vendido'),
  ]);

  return {
    categoria: categoriaRes.data,
    subcategorias: subcategoriasRes.data || [],
    productos: productosRes.data || [],
  };
}

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { sub, orden } = await searchParams;
  
  const categoriaId = parseInt(id);
  const { categoria, subcategorias, productos } = await getData(categoriaId);

  if (!categoria) notFound();

  let productosFiltrados = productos;
  if (sub) {
    productosFiltrados = productos.filter(
      (p) => p.subcategoria_id === parseInt(sub)
    );
  }

  if (orden === 'precio') {
    productosFiltrados.sort(
      (a, b) => (a.precio_oferta || a.precio) - (b.precio_oferta || b.precio)
    );
  } else {
    productosFiltrados.sort((a, b) => (b.clicks_whatsapp || 0) - (a.clicks_whatsapp || 0));
  }

  return (
    <div>
      {/* Header con filtros */}
      <div className="sticky top-14 bg-white z-30 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/categorias" className="p-2 -ml-2 text-gray-600">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-gray-800">
              {categoria.emoji} {categoria.nombre}
            </h1>
            <p className="text-xs text-gray-400">
              {productosFiltrados.length} productos
            </p>
          </div>
        </div>

        {/* Subcategorías */}
        {subcategorias.length > 0 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
            <Link
              href={`/categoria/${categoriaId}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !sub ? 'text-white' : 'bg-gray-100 text-gray-600'
              }`}
              style={!sub ? { background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' } : {}}
            >
              Todos
            </Link>
            {subcategorias.map((subcat) => (
              <Link
                key={subcat.id}
                href={`/categoria/${categoriaId}?sub=${subcat.id}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  sub === String(subcat.id) ? 'text-white' : 'bg-gray-100 text-gray-600'
                }`}
                style={
                  sub === String(subcat.id)
                    ? { background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' }
                    : {}
                }
              >
                {subcat.nombre}
              </Link>
            ))}
          </div>
        )}

        {/* Ordenar */}
        <div className="px-4 pb-3 flex gap-2">
          <Link
            href={`/categoria/${categoriaId}${sub ? `?sub=${sub}` : ''}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !orden || orden === 'popular' ? 'text-white' : 'bg-gray-100 text-gray-600'
            }`}
            style={
              !orden || orden === 'popular'
                ? { background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' }
                : {}
            }
          >
            ⭐ Popular
          </Link>
          <Link
            href={`/categoria/${categoriaId}?${sub ? `sub=${sub}&` : ''}orden=precio`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              orden === 'precio' ? 'text-white' : 'bg-gray-100 text-gray-600'
            }`}
            style={
              orden === 'precio'
                ? { background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' }
                : {}
            }
          >
            💰 Precio
          </Link>
        </div>
      </div>

      {/* Grid de productos - Responsive mejorado */}
      <div className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {productosFiltrados.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">📦</span>
            <p className="text-gray-500">No hay productos en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  );
}