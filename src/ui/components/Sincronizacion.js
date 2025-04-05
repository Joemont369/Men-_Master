
import React, { useState, useEffect } from 'react';
import { ejecutarSincronizacionCompleta, esTiempoDeSincronizar } from '../../core/use-cases/sincronizacion';
import { obtenerLocal } from '../../infra/localstore/storage';

export default function Sincronizacion() {
  const [sincronizando, setSincronizando] = useState(false);
  const [estado, setEstado] = useState({
    ultimaSincronizacion: obtenerLocal('ultima_sincronizacion_completa') || 'nunca',
    cambiosSincronizados: 0,
    error: null
  });
  const [visible, setVisible] = useState(false);

  // Sincronización automática cada 5 minutos o cuando se monta el componente
  useEffect(() => {
    const realizarSincronizacion = async () => {
      if (sincronizando) return;
      
      try {
        setSincronizando(true);
        setVisible(true);
        
        const resultado = await ejecutarSincronizacionCompleta();
        
        setEstado({
          ultimaSincronizacion: resultado.ultimaSincronizacion,
          cambiosSincronizados: 
            (resultado.menuTemporal?.cantidadCambios || 0) + 
            (resultado.estadisticas?.sincronizado ? 1 : 0),
          error: resultado.error
        });
        
        // Ocultar después de 3 segundos
        setTimeout(() => setVisible(false), 3000);
      } catch (error) {
        console.error('Error en sincronización:', error);
        setEstado(prev => ({
          ...prev,
          error: error.message
        }));
      } finally {
        setSincronizando(false);
      }
    };

    // Sincronizar al montar el componente si es necesario
    if (esTiempoDeSincronizar()) {
      realizarSincronizacion();
    }
    
    // Configurar sincronización periódica
    const intervalo = setInterval(() => {
      if (esTiempoDeSincronizar()) {
        realizarSincronizacion();
      }
    }, 60000); // Verificar cada minuto
    
    return () => clearInterval(intervalo);
  }, []);

  // Sincronización manual
  const sincronizarManualmente = () => {
    ejecutarSincronizacionCompleta()
      .then(resultado => {
        setEstado({
          ultimaSincronizacion: resultado.ultimaSincronizacion,
          cambiosSincronizados: 
            (resultado.menuTemporal?.cantidadCambios || 0) + 
            (resultado.estadisticas?.sincronizado ? 1 : 0),
          error: resultado.error
        });
        setVisible(true);
        setTimeout(() => setVisible(false), 3000);
      })
      .catch(error => {
        console.error('Error en sincronización manual:', error);
        setEstado(prev => ({
          ...prev,
          error: error.message
        }));
        setVisible(true);
      });
  };

  // Si no está visible, mostrar solo botón de sincronización
  if (!visible && !sincronizando) {
    return (
      <button 
        className="btn-sincronizar" 
        onClick={sincronizarManualmente}
        title="Sincronizar datos"
      >
        🔄
      </button>
    );
  }

  return (
    <div className={`sincronizacion-container ${visible ? 'visible' : ''}`}>
      {sincronizando ? (
        <div className="sincronizando">
          <span className="icono-sincronizando">🔄</span>
          <span>Sincronizando datos...</span>
        </div>
      ) : estado.error ? (
        <div className="sincronizacion-error">
          <span>❌ Error: {estado.error}</span>
          <button onClick={sincronizarManualmente}>Reintentar</button>
        </div>
      ) : (
        <div className="sincronizacion-info">
          <span>✅ Datos sincronizados ({estado.cambiosSincronizados})</span>
          <small>Última: {new Date(estado.ultimaSincronizacion).toLocaleTimeString()}</small>
        </div>
      )}
    </div>
  );
}
