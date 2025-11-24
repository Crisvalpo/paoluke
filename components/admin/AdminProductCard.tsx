'use client';
import Image from 'next/image';
import { Producto } from '@/lib/types';
import { formatPrice, formatSku, calcularStock, estadoConfig } from '@/lib/utils';
import { getImageUrl } from '@/lib/supabase';
import { Pencil, ArrowLeftRight, Trash2 } from 'lucide-react';

interface Props {
  producto: Producto;
  onEdit: () => void;
  onEstado: () => void;
  onDelete: () => void;
}

export default function AdminProductCard({ producto, onEdit, onEstado, onDelete }: Props) {
  const stock = calcularStock(producto.variantes);
  const estado = estadoConfig[producto.estado];
  const tieneFoto = producto.fotos && producto.fotos.length > 0;

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm flex gap-3 items-center hover:shadow-md transition-shadow">
      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
        {tieneFoto ? (
          <Image
            src={getImageUrl(producto.fotos[0])}
            alt={producto.nombre}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          '📦'
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">
          {formatSku(producto.id)} · {producto.ubicacion || 'Sin ubicación'}
        </p>
        <h3 className="font-semibold text-gray-800 text-sm truncate">
          {producto.nombre}
        </h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className="font-bold text-sm"
            style={{ color: producto.precio_oferta ? '#E91E8C' : '#212121' }}
          >
            {formatPrice(producto.precio_oferta || producto.precio)}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full text-white"
            style={{ background: estado.color }}
          >
            {estado.label}
          </span>
          {stock <= 2 && stock > 0 && (
            <span className="text-xs text-orange-500">Stock: {stock}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Editar producto"
        >
          <Pencil size={20} />
        </button>
        <button
          onClick={onEstado}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Cambiar estado"
        >
          <ArrowLeftRight size={20} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Eliminar producto"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}