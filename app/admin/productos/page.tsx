'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useProductos } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import { Producto } from '@/lib/types';
import AdminProductCard from '@/components/admin/AdminProductCard';
import EstadoModal from '@/components/admin/EstadoModal';

export default function ProductosPage() {
  const { productos, setProductos, loading, reload } = useProductos();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [modalEstado, setModalEstado] = useState<Producto | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const filtros = [
    { key: 'todos', label: 'Todos', color: '#6B7280' },
    { key: 'disponible', label: 'Disponibles', color: '#10B981' },
    { key: 'reservado', label: 'Reservados', color: '#F59E0B' },
    { key: 'vendido', label: 'Vendidos', color: '#EF4444' },
  ];

  let productosFiltrados = productos;

  if (filtroEstado !== 'todos') {
    productosFiltrados = productosFiltrados.filter((p) => p.estado === filtroEstado);
  }

  if (busqueda) {
    const search = busqueda.toLowerCase().replace('#', '');
    productosFiltrados = productosFiltrados.filter(
      (p) =>
        p.nombre.toLowerCase().includes(search) ||
        String(p.id).includes(search) ||
        p.ubicacion?.toLowerCase().includes(search)
    );
  }

  const cambiarEstado = async (estado: 'disponible' | 'reservado' | 'vendido') => {
    if (!modalEstado) return;

    const updates: any = { estado };
    if (estado === 'vendido') {
      updates.vendido_at = new Date().toISOString();
    } else {
      updates.vendido_at = null;
    }

    await supabase.from('productos').update(updates).eq('id', modalEstado.id);

    setProductos(
      productos.map((p) =>
        p.id === modalEstado.id ? { ...p, ...updates } : p
      )
    );
    setModalEstado(null);
  };

  const eliminarProducto = async (producto: Producto) => {
    const confirmar = window.confirm(
      `¿Estás segura de eliminar "${producto.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    setEliminando(producto.id);

    try {
      // 1. Eliminar fotos del storage
      if (producto.fotos && producto.fotos.length > 0) {
        const fotosInternas = producto.fotos.filter(f => !f.startsWith('http'));
        if (fotosInternas.length > 0) {
          await supabase.storage.from('productos').remove(fotosInternas);
        }
      }

      // 2. Eliminar producto de la base de datos
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', producto.id);

      if (error) throw error;

      // 3. Actualizar lista local
      setProductos(productos.filter((p) => p.id !== producto.id));
      
      alert('✅ Producto eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('❌ Error al eliminar el producto. Intenta de nuevo.');
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div>
      <div className="sticky top-0 bg-white z-30 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg text-gray-800">Productos</h1>
          <Link
            href="/admin/producto/nuevo"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' }}
          >
            <Plus size={24} />
          </Link>
        </div>

        {/* Búsqueda */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar SKU, nombre, ubicación..."
              className="w-full pl-12 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Filtros de estado */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {filtros.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltroEstado(f.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filtroEstado === f.key ? 'text-white' : 'bg-gray-100'
              }`}
              style={
                filtroEstado === f.key
                  ? { background: f.color }
                  : { color: f.color }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : productosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {productosFiltrados.map((p) => (
              <div key={p.id} className={eliminando === p.id ? 'opacity-50 pointer-events-none' : ''}>
                <AdminProductCard
                  producto={p}
                  onEdit={() => window.location.href = `/admin/producto/${p.id}`}
                  onEstado={() => setModalEstado(p)}
                  onDelete={() => eliminarProducto(p)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">📦</span>
            <p className="text-gray-500">No hay productos</p>
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="mt-3 text-sm text-pink-500 font-medium"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>

      {modalEstado && (
        <EstadoModal
          producto={modalEstado}
          onClose={() => setModalEstado(null)}
          onChange={cambiarEstado}
        />
      )}
    </div>
  );
}