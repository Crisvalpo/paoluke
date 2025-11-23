'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, User, Phone, MapPin, Package, Plus, Trash2, Search } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '@/lib/supabase';

interface ProductoItem {
  id: number;
  nombre: string;
  sku: string;
  talla: string;
  precio: number;
  cantidad: number;
  producto_id?: number;
}

interface TicketData {
  cliente: string;
  telefono: string;
  direccion: string;
  productos: ProductoItem[];
  envio: string;
}

interface ConfigData {
  nombre_tienda: string;
  whatsapp: string;
  instagram: string;
  direccion: string;
  horario: string;
}

interface ProductoDB {
  id: number;
  nombre: string;
  precio: number;
  precio_oferta: number | null;
  variantes: any[];
}

export default function TicketPage() {
  const [ticketData, setTicketData] = useState<TicketData>({
    cliente: '',
    telefono: '',
    direccion: '',
    productos: [
      {
        id: 1,
        nombre: '',
        sku: '',
        talla: '',
        precio: 0,
        cantidad: 1
      }
    ],
    envio: 'Blue Express'
  });

  const [config, setConfig] = useState<ConfigData | null>(null);
  const [productosVendidos, setProductosVendidos] = useState<ProductoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Cargar configuración y productos vendidos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Cargar configuración
        const { data: configData, error: configError } = await supabase
          .from('config')
          .select('nombre_tienda, whatsapp, instagram, direccion, horario')
          .single();

        if (configError) {
          console.error('Error cargando configuración:', configError);
        } else if (configData) {
          setConfig(configData);
        }

        // Cargar productos vendidos
        await cargarProductosVendidos();

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const cargarProductosVendidos = async () => {
    try {
      setCargandoProductos(true);
      const { data, error } = await supabase
        .from('productos')
        .select('id, nombre, precio, precio_oferta, variantes')
        .eq('estado', 'vendido')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error cargando productos vendidos:', error);
        return;
      }

      if (data) {
        setProductosVendidos(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargandoProductos(false);
    }
  };

  // Función de impresión corregida
  const handlePrint = useReactToPrint({
    content: () => {
      if (!ticketRef.current) {
        console.error('No se encontró la referencia del ticket');
        return null;
      }
      return ticketRef.current;
    },
    pageStyle: `
      @page { 
        size: 58mm auto; 
        margin: 0; 
        padding: 0;
      }
      @media print {
        body { 
          margin: 0; 
          padding: 0; 
          width: 58mm;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
    documentTitle: `Ticket-${new Date().getTime()}`,
    onPrintError: (error) => {
      console.error('Error al imprimir:', error);
      alert('Error al imprimir. Verifica la consola para más detalles.');
    }
  });

  // Cuando se selecciona un producto del dropdown
  const seleccionarProducto = (productoIndex: number, productoDB: ProductoDB) => {
    const precio = productoDB.precio_oferta || productoDB.precio;
    
    // Obtener tallas disponibles (primera talla por defecto)
    const talla = productoDB.variantes?.[0]?.t || 'Única';
    const sku = `#${productoDB.id.toString().padStart(5, '0')}`;

    actualizarProducto(
      ticketData.productos[productoIndex].id,
      'nombre',
      productoDB.nombre
    );
    
    actualizarProducto(
      ticketData.productos[productoIndex].id,
      'sku',
      sku
    );
    
    actualizarProducto(
      ticketData.productos[productoIndex].id,
      'talla',
      talla
    );
    
    actualizarProducto(
      ticketData.productos[productoIndex].id,
      'precio',
      precio
    );

    // Guardar el ID real del producto
    setTicketData(prev => ({
      ...prev,
      productos: prev.productos.map((p, index) =>
        index === productoIndex 
          ? { ...p, producto_id: productoDB.id }
          : p
      )
    }));
  };

  // Agregar nuevo producto
  const agregarProducto = () => {
    setTicketData(prev => ({
      ...prev,
      productos: [
        ...prev.productos,
        {
          id: prev.productos.length + 1,
          nombre: '',
          sku: '',
          talla: '',
          precio: 0,
          cantidad: 1
        }
      ]
    }));
  };

  // Eliminar producto
  const eliminarProducto = (id: number) => {
    if (ticketData.productos.length === 1) return;
    
    setTicketData(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.id !== id)
    }));
  };

  // Actualizar producto
  const actualizarProducto = (id: number, campo: keyof ProductoItem, valor: any) => {
    setTicketData(prev => ({
      ...prev,
      productos: prev.productos.map(p =>
        p.id === id ? { ...p, [campo]: valor } : p
      )
    }));
  };

  // Calcular total
  const calcularTotal = () => {
    return ticketData.productos.reduce((total, producto) => {
      return total + (producto.precio * producto.cantidad);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return price > 0 ? `$${price.toLocaleString('es-CL')}` : '$0';
  };

  const formatSku = (id: number) => {
    return `#${id.toString().padStart(5, '0')}`;
  };

  const totalTicket = calcularTotal();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white z-30 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 -ml-2 text-gray-600">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="font-bold text-lg text-gray-800">Generar Ticket</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cargarProductosVendidos}
            disabled={cargandoProductos}
            className="px-3 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-xl text-sm flex items-center gap-2 no-print"
          >
            <Search size={16} />
            {cargandoProductos ? 'Cargando...' : 'Actualizar'}
          </button>
          <button
            onClick={handlePrint}
            disabled={!ticketData.cliente || ticketData.productos.some(p => !p.nombre)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center gap-2 no-print"
          >
            <Printer size={18} />
            Imprimir Ticket
          </button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* Mensaje para móviles */}
        <div className="lg:hidden bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center mb-4">
          <div className="text-2xl mb-2">🖨️</div>
          <h3 className="font-bold text-yellow-800 mb-2">Usa desde computador</h3>
          <p className="text-yellow-700 text-sm">
            El generador de tickets funciona mejor desde un computador 
            con impresora térmica conectada.
          </p>
        </div>

        {/* Información de la tienda */}
        {config && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 no-print">
            <h3 className="font-bold text-blue-800 mb-2">Información de PaoLUKE</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Dirección:</strong> {config.direccion}</div>
              <div><strong>Horario:</strong> {config.horario}</div>
              <div><strong>Instagram:</strong> @{config.instagram}</div>
              <div><strong>WhatsApp:</strong> {config.whatsapp}</div>
              <div><strong>Productos vendidos:</strong> {productosVendidos.length} encontrados</div>
            </div>
          </div>
        )}

        {/* Formulario de datos */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 no-print">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} />
            Datos del Cliente
          </h2>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre del Cliente</label>
              <input
                type="text"
                value={ticketData.cliente}
                onChange={(e) => setTicketData(prev => ({ ...prev, cliente: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce nombre del cliente"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                <Phone size={16} />
                Teléfono
              </label>
              <input
                type="text"
                value={ticketData.telefono}
                onChange={(e) => setTicketData(prev => ({ ...prev, telefono: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce teléfono"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                <MapPin size={16} />
                Dirección de envío
              </label>
              <textarea
                value={ticketData.direccion}
                onChange={(e) => setTicketData(prev => ({ ...prev, direccion: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce dirección completa"
              />
            </div>
          </div>

          <h2 className="font-bold text-gray-800 mb-4 mt-6 flex items-center gap-2">
            <Package size={20} />
            Productos ({ticketData.productos.length})
            <button
              onClick={agregarProducto}
              className="ml-auto bg-green-500 hover:bg-green-600 text-white p-1 rounded"
            >
              <Plus size={16} />
            </button>
          </h2>

          <div className="space-y-4">
            {ticketData.productos.map((producto, index) => (
              <div key={producto.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-700">Producto {index + 1}</span>
                  {ticketData.productos.length > 1 && (
                    <button
                      onClick={() => eliminarProducto(producto.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Selector de productos vendidos */}
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Buscar producto vendido
                  </label>
                  <select
                    value={producto.producto_id || ''}
                    onChange={(e) => {
                      const productoId = parseInt(e.target.value);
                      if (productoId) {
                        const productoDB = productosVendidos.find(p => p.id === productoId);
                        if (productoDB) {
                          seleccionarProducto(index, productoDB);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un producto vendido...</option>
                    {productosVendidos.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {formatSku(prod.id)} - {prod.nombre} - ${(prod.precio_oferta || prod.precio).toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {productosVendidos.length} productos vendidos disponibles
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre</label>
                    <input
                      type="text"
                      value={producto.nombre}
                      onChange={(e) => actualizarProducto(producto.id, 'nombre', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del producto"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">SKU</label>
                      <input
                        type="text"
                        value={producto.sku}
                        onChange={(e) => actualizarProducto(producto.id, 'sku', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SKU"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Talla</label>
                      <input
                        type="text"
                        value={producto.talla}
                        onChange={(e) => actualizarProducto(producto.id, 'talla', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Talla"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Precio</label>
                      <input
                        type="number"
                        value={producto.precio}
                        onChange={(e) => actualizarProducto(producto.id, 'precio', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Cantidad</label>
                      <input
                        type="number"
                        value={producto.cantidad}
                        onChange={(e) => actualizarProducto(producto.id, 'cantidad', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-right text-sm font-medium">
                  Subtotal: {formatPrice(producto.precio * producto.cantidad)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">TOTAL:</span>
              <span className="font-bold text-lg text-blue-600">{formatPrice(totalTicket)}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Método de envío</label>
            <select
              value={ticketData.envio}
              onChange={(e) => setTicketData(prev => ({ ...prev, envio: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Blue Express">Blue Express</option>
              <option value="Chilexpress">Chilexpress</option>
              <option value="Starken">Starken</option>
              <option value="Retiro en tienda">Retiro en tienda</option>
            </select>
          </div>
        </div>

        {/* Vista previa del ticket */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3 no-print">Vista Previa del Ticket</h2>
          
          <div 
            ref={ticketRef}
            className="bg-white p-3 w-full max-w-[58mm] mx-auto font-mono text-xs border-2 border-gray-200 rounded-lg"
            style={{ 
              fontFamily: "'Courier New', monospace",
              lineHeight: '1.2'
            }}
          >
            {/* Ticket térmico con datos reales */}
            <div className="text-center mb-2">
              <div className="font-bold text-sm mb-1">🎭 {config?.nombre_tienda || 'PAOLUKE'}</div>
              <div className="border-b border-black w-full mb-2"></div>
            </div>

            <div className="mb-2">
              <div>Fecha: {new Date().toLocaleDateString('es-CL')} {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>

            <div className="mb-2">
              <div>Cliente: {ticketData.cliente || '________________'}</div>
              <div>Fono: {ticketData.telefono || '________________'}</div>
            </div>

            <div className="mb-2">
              <div>Dirección de envío:</div>
              <div className="whitespace-pre-line">{ticketData.direccion || '________________'}</div>
            </div>

            <div className="border-t border-black my-2"></div>

            <div className="mb-2">
              <div className="font-bold mb-1">PRODUCTOS:</div>
              {ticketData.productos.map((producto, index) => (
                <div key={producto.id} className="mb-1">
                  <div>{producto.nombre || '________________'}</div>
                  <div className="text-xs">
                    SKU: {producto.sku || '______'} | Talla: {producto.talla || '___'} | 
                    Cant: {producto.cantidad} | {formatPrice(producto.precio)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-black my-2"></div>

            <div className="mb-2">
              <div className="font-bold">TOTAL: {formatPrice(totalTicket)}</div>
              <div>Envío: {ticketData.envio}</div>
            </div>

            <div className="border-t border-black my-2"></div>

            <div className="text-center text-sm">
              <div>¡Gracias por tu compra!</div>
              <div>Instagram: @{config?.instagram || 'paoluke.cl'}</div>
              {config?.direccion && (
                <div className="text-xs mt-1">{config.direccion}</div>
              )}
            </div>

            <div className="border-b border-black w-full mt-2"></div>
          </div>

          <div className="text-center mt-4 no-print">
            <p className="text-xs text-gray-500">
              Tamaño: 58mm (impresora térmica) | Productos: {ticketData.productos.length}
            </p>
            {(!ticketData.cliente || ticketData.productos.some(p => !p.nombre)) && (
              <p className="text-xs text-orange-500 mt-2">
                Completa los datos obligatorios para imprimir
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}