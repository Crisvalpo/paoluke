'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Config {
  id: number;
  banner_activo: boolean;
  banner_texto: string;
  banner_subtexto: string;
  banner_emoji: string;
}

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
    
    // Suscribirse a cambios en tiempo real de Supabase
    const subscription = supabase
      .channel('config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'config'
        },
        (payload) => {
          console.log('Config actualizada:', payload.new);
          setConfig(payload.new as Config);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase.from('config').select('*').single();
      
      if (error) {
        console.error('Error cargando config:', error);
        return;
      }
      
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  return { config, loading };
}