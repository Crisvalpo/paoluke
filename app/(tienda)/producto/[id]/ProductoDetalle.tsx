'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Producto, Config } from '@/lib/types';
import { formatPrice, formatSku, calcularDescuento, calcularStock } from '@/lib/utils';
import { getImageUrl, supabase } from '@/lib/supabase';
import WhatsAppButton from '@/components/tienda/WhatsAppButton';

interface Props {
  producto: Producto;
  config: Config;
}

export default function ProductoDetalle({ producto, config }: Props) {
  const [talla, setTalla] = useState<string | null>(null);
  const [fotoActiva, setFotoActiva] = useState(0);

  const tieneOferta = producto.precio_oferta !== null;
  const precio = tieneOferta ? producto.precio_oferta! : producto.precio;
  const stock = calcularStock(producto.variantes);

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <Link href="/" className="p-2 -ml-2 text-gray-600">
          <ChevronLeft size={24} />
        </Link>
        <span className="text-sm text-gray-400">{formatSku(producto.id)}</span>
        <div className="w-10" />
      </div>

      {/* Galería de fotos */}
      <div className="relative bg-gray-100">
        <div className="aspect-square relative">
          {producto.fotos && producto.fotos.length > 0 ? (
            <Image
              src={getImageUrl(producto.fotos[fotoActiva])}
              alt={producto.nombre}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              📦
            </div>
          )}
        </div>

        {tieneOferta && (
          <div
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' }}
          >
            {calcularDescuento(producto.precio, producto.precio_oferta!)}% OFF
          </div>
        )}

        {stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-xl">AGOTADO</span>
          </div>
        )}

        {/* Thumbnails */}
        {producto.fotos && producto.fotos.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
            {producto.fotos.map((foto, i) => (
              <button
                key={i}
                onClick={() => setFotoActiva(i)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 ${
                  fotoActiva === i ? 'border-pink-500' : 'border-white'
                }`}
              >
                <Image
                  src={getImageUrl(foto)}
                  alt=""
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Indicadores */}
        {producto.fotos && producto.fotos.length > 1 && (
          <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1">
            {producto.fotos.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  fotoActiva === i ? 'bg-pink-500' : 'bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        <span className="text-sm text-gray-400">
          {producto.categoria?.nombre}
        </span>
        <h1 className="text-xl font-bold text-gray-800 mt-1 mb-2">
          {producto.nombre}
        </h1>

        {/* Precio */}
        <div className="flex items-baseline gap-3 mb-5">
          <span
            className="text-2xl font-bold"
            style={{ color: tieneOferta ? '#E91E8C' : '#212121' }}
          >
            {formatPrice(precio)}
          </span>
          {tieneOferta && (
            <span className="text-base text-gray-400 line-through">
              {formatPrice(producto.precio)}
            </span>
          )}
        </div>

        {/* Tallas */}
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Selecciona talla:
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {producto.variantes.map((v) => {
            const agotada = v.s === 0;
            const seleccionada = talla === v.t;

            return (
              <button
                key={v.t}
                disabled={agotada}
                onClick={() => setTalla(v.t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  agotada
                    ? 'bg-gray-100 text-gray-300'
                    : seleccionada
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700'
                }`}
                style={
                  seleccionada && !agotada
                    ? { background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' }
                    : {}
                }
              >
                {v.t}
                {agotada && ' - Agotado'}
                {!agotada && v.s <= 2 && ` (${v.s})`}
              </button>
            );
          })}
        </div>

        {/* Espaciado para botón fijo - REDUCIDO */}
        <div className="h-16" />
      </div>

      {/* Botón WhatsApp fijo - CORREGIDO */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50 shadow-lg">
        <WhatsAppButton
          producto={producto}
          talla={talla}
          whatsapp={config.whatsapp}
        />
      </div>
    </div>
  );
}