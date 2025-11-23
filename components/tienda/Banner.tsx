'use client';
import { useConfig } from '@/lib/useConfig';

/*
// BACKUP - CÓDIGO ANTERIOR (BANNER ESTÁTICO)
interface Props {
  titulo: string;
  subtitulo: string;
  emoji?: string;
}

export default function Banner({ titulo, subtitulo, emoji = '🎄' }: Props) {
  return (
    <div 
      className="rounded-2xl p-5 mb-5 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' }}
    >
      <p className="text-sm opacity-90 mb-1">✨ Temporada</p>
      <h2 className="text-2xl font-bold mb-1">{titulo}</h2>
      <p className="text-sm opacity-90">{subtitulo}</p>
      <div className="absolute -right-4 -bottom-4 text-7xl opacity-20">
        {emoji}
      </div>
    </div>
  );
}
*/

// NUEVA VERSIÓN - BANNER DINÁMICO
interface Props {
  titulo?: string;
  subtitulo?: string;
  emoji?: string;
}

export default function Banner({ 
  titulo, 
  subtitulo, 
  emoji = '🎄' 
}: Props) {
  const { config, loading } = useConfig();

  if (loading) {
    return (
      <div className="rounded-2xl p-5 mb-5 bg-gray-200 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
      </div>
    );
  }

  // Si tenemos configuración y el banner está activo
  if (config && config.banner_activo) {
    return (
      <div 
        className="rounded-2xl p-5 mb-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' }}
      >
        <p className="text-sm opacity-90 mb-1">✨ Temporada</p>
        <h2 className="text-2xl font-bold mb-1">
          {config.banner_texto || titulo}
        </h2>
        <p className="text-sm opacity-90">
          {config.banner_subtexto || subtitulo}
        </p>
        <div className="absolute -right-4 -bottom-4 text-7xl opacity-20">
          {config.banner_emoji || emoji}
        </div>
      </div>
    );
  }

  // Fallback a props estáticas si no hay configuración en BD
  if (titulo && subtitulo) {
    return (
      <div 
        className="rounded-2xl p-5 mb-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #E91E8C, #00BCD4)' }}
      >
        <p className="text-sm opacity-90 mb-1">✨ Temporada</p>
        <h2 className="text-2xl font-bold mb-1">{titulo}</h2>
        <p className="text-sm opacity-90">{subtitulo}</p>
        <div className="absolute -right-4 -bottom-4 text-7xl opacity-20">
          {emoji}
        </div>
      </div>
    );
  }

  // No mostrar nada si no hay configuración ni props
  return null;
}