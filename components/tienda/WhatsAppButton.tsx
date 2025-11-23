'use client';
import { Producto } from '@/lib/types';
import { formatPrice, formatSku } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { MessageCircle } from 'lucide-react';

interface Props {
  producto: Producto;
  talla: string | null;
  whatsapp: string;
}

export default function WhatsAppButton({ producto, talla, whatsapp }: Props) {
  const tieneOferta = producto.precio_oferta !== null;
  const precio = tieneOferta ? producto.precio_oferta! : producto.precio;
  const stock = producto.variantes?.reduce((total, v) => total + v.s, 0) || 0;
  const agotado = stock === 0;

  const handleClick = async () => {
    if (agotado) return;
  
    const tieneTallas = producto.variantes && producto.variantes.length > 0;
    const necesitaTalla = tieneTallas && !talla;
  
    if (necesitaTalla) {
      alert('Por favor selecciona una talla antes de continuar');
      return;
    }
  
    // 1️⃣ Leer el template desde la BD
    let template = null;
    
    try {
      const { data, error } = await supabase
        .from('config')
        .select('mensaje_whatsapp_template')
        .single();
  
      if (!error && data?.mensaje_whatsapp_template) {
        template = data.mensaje_whatsapp_template;
      }
    } catch (e) {
      console.error('Error cargando template de WhatsApp', e);
    }
  
    // 2️⃣ Mensaje por defecto si la BD no devuelve nada
    if (!template) {
      template = `Hola! Me interesa:
  
  Producto: {producto}
  SKU: {sku}
  Talla: {talla}
  Precio: {precio}
  
  Vi el producto en PaoLUKE`;
    }
  
    // 3️⃣ Rellenar el mensaje con datos reales
    let mensaje = template
      .replace('{producto}', producto.nombre)
      .replace('{sku}', formatSku(producto.id))
      .replace('{talla}', talla || 'Única')
      .replace('{precio}', formatPrice(precio));
  
    // 4️⃣ Eliminar emojis (WhatsApp Web falla con algunos)
    mensaje = mensaje.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
  
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  
    // 5️⃣ Registrar el click en la tabla productos
    try {
      await supabase
        .from('productos')
        .update({ clicks_whatsapp: (producto.clicks_whatsapp || 0) + 1 })
        .eq('id', producto.id);
    } catch (error) {
      console.error('Error contando click:', error);
    }
  };
  

  if (agotado) {
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
      >
        <MessageCircle size={20} />
        Producto Agotado
      </button>
    );
  }

  const tieneTallas = producto.variantes && producto.variantes.length > 0;
  const necesitaTalla = tieneTallas && !talla;

  return (
    <button
      onClick={handleClick}
      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
        necesitaTalla
          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
          : 'bg-green-500 hover:bg-green-600 text-white'
      }`}
    >
      <MessageCircle size={20} />
      {necesitaTalla ? 'Selecciona una talla' : '¡Lo quiero! por WhatsApp'}
    </button>
  );
}
