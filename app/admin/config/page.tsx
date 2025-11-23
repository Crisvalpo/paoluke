'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Config {
  id: number;
  nombre_tienda: string;
  descripcion: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  direccion: string;
  horario: string;
  banner_activo: boolean;
  banner_texto: string;
  banner_subtexto: string;
  banner_emoji: string;
  mensaje_whatsapp_template: string;
  logo_svg: string;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data } = await supabase.from('config').select('*').single();
    if (data) {
      setConfig(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    setMensaje('');

    try {
      const { error } = await supabase
        .from('config')
        .update(config)
        .eq('id', config.id);

      if (error) throw error;

      setMensaje('✅ Configuración guardada correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error guardando:', error);
      setMensaje('❌ Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white z-30 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 -ml-2 text-gray-600">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="font-bold text-lg text-gray-800">Configuración</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-white font-medium text-sm disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' }}
        >
          <Save size={18} />
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="p-4 space-y-5 pb-8">
        {/* Mensaje de éxito/error */}
        {mensaje && (
          <div
            className={`p-4 rounded-xl text-sm font-medium ${
              mensaje.includes('✅')
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {mensaje}
          </div>
        )}

        {/* Información General */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">📋 Información General</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Nombre de la tienda
              </label>
              <input
                type="text"
                value={config.nombre_tienda}
                onChange={(e) => setConfig({ ...config, nombre_tienda: e.target.value })}
                placeholder="PaoLUKE"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="space-y-2">
  <label htmlFor="logo_svg" className="block text-sm font-medium">
    Logo SVG
  </label>
  <textarea
    id="logo_svg"
    name="logo_svg"
    rows={10}
    placeholder="Pega aquí el código SVG..."
    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
    defaultValue={config.logo_svg || ''}
  />
  {config.logo_svg && (
    <div className="mt-2">
      <p className="text-sm text-gray-600">Vista previa del logo:</p>
      <div 
        className="mt-1 p-4 border border-gray-200 rounded-md bg-white flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: config.logo_svg }}
      />
    </div>
  )}
</div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Descripción
              </label>
              <textarea
                value={config.descripcion}
                onChange={(e) => setConfig({ ...config, descripcion: e.target.value })}
                placeholder="Disfraces y Ropa Americana de Calidad"
                rows={3}
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Dirección
              </label>
              <input
                type="text"
                value={config.direccion}
                onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                placeholder="Calle Principal #123, Villa Alemana"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Horario de atención
              </label>
              <input
                type="text"
                value={config.horario}
                onChange={(e) => setConfig({ ...config, horario: e.target.value })}
                placeholder="Lun-Vie: 9:00-19:00, Sáb: 10:00-14:00"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">📱 Contacto</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                WhatsApp (sin espacios ni guiones)
              </label>
              <div className="relative">
                <input
                  type={showWhatsApp ? 'text' : 'password'}
                  value={config.whatsapp}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value.replace(/\D/g, '') })}
                  placeholder="56935264052"
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowWhatsApp(!showWhatsApp)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showWhatsApp ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Ejemplo: 56935264052 (código país + número)
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                placeholder="contacto@paoluke.cl"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Instagram (usuario)
              </label>
              <input
                type="text"
                value={config.instagram}
                onChange={(e) => setConfig({ ...config, instagram: e.target.value.replace('@', '') })}
                placeholder="paoluke.cl"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Sin @ al inicio
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Facebook (usuario)
              </label>
              <input
                type="text"
                value={config.facebook}
                onChange={(e) => setConfig({ ...config, facebook: e.target.value })}
                placeholder="paoluke"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </section>

        {/* Banner Principal */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">🎨 Banner Principal</h2>
            <button
              type="button"
              onClick={() => setConfig({ ...config, banner_activo: !config.banner_activo })}
              className={`w-12 h-7 rounded-full transition-colors ${
                config.banner_activo ? '' : 'bg-gray-300'
              }`}
              style={
                config.banner_activo
                  ? { background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' }
                  : {}
              }
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  config.banner_activo ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Emoji
              </label>
              <input
                type="text"
                value={config.banner_emoji}
                onChange={(e) => setConfig({ ...config, banner_emoji: e.target.value })}
                placeholder="🎄"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                maxLength={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Título
              </label>
              <input
                type="text"
                value={config.banner_texto}
                onChange={(e) => setConfig({ ...config, banner_texto: e.target.value })}
                placeholder="¡Navidad 2025!"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Subtítulo
              </label>
              <input
                type="text"
                value={config.banner_subtexto}
                onChange={(e) => setConfig({ ...config, banner_subtexto: e.target.value })}
                placeholder="El disfraz perfecto"
                className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Vista previa del banner */}
            {config.banner_activo && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Vista previa:</p>
                <div 
                  className="rounded-2xl p-5 text-white relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' }}
                >
                  <p className="text-sm opacity-90 mb-1">✨ Temporada</p>
                  <h2 className="text-2xl font-bold mb-1">{config.banner_texto}</h2>
                  <p className="text-sm opacity-90">{config.banner_subtexto}</p>
                  <div className="absolute -right-4 -bottom-4 text-7xl opacity-20">
                    {config.banner_emoji}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Mensaje WhatsApp */}
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">💬 Plantilla WhatsApp</h2>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Mensaje predeterminado
            </label>
            <textarea
              value={config.mensaje_whatsapp_template}
              onChange={(e) => setConfig({ ...config, mensaje_whatsapp_template: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
            />
            <p className="text-xs text-gray-400 mt-2">
              Variables disponibles: {'{producto}'}, {'{sku}'}, {'{talla}'}, {'{precio}'}
            </p>
          </div>
        </section>

        {/* Información adicional */}
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-600">
          <p className="font-medium mb-2">💡 Consejos:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>El número de WhatsApp debe incluir código de país (56 para Chile)</li>
            <li>El banner se muestra en la página principal de la tienda</li>
            <li>Los cambios se aplican inmediatamente al guardar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}