import { Producto } from '@/lib/types';
import ProductCard from './ProductCard';

interface Props {
  productos: Producto[];
  titulo?: string;
  verTodo?: string;
}

export default function ProductGrid({ productos, titulo, verTodo }: Props) {
  if (productos.length === 0) return null;

  return (
    <section className="mb-5">
      {titulo && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 text-lg">{titulo}</h3>
          {verTodo && (
            <a href={verTodo} className="text-sm font-medium hover:underline" style={{ color: '#E91E8C' }}>
              Ver todo
            </a>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {productos.map((p) => (
          <ProductCard key={p.id} producto={p} />
        ))}
      </div>
    </section>
  );
}