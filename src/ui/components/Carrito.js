
import React, { useState, useEffect } from 'react';
import { agregarOrden } from '../../core/use-cases/agregarOrden';
import { guardarLocal, obtenerLocal } from '../../infra/localstore/storage';
import { sincronizarEstadisticasLocales } from '../../core/use-cases/estadisticas';

export default function Carrito({ items, setItems }) {
  const [enviandoOrden, setEnviandoOrden] = useState(false);
  const [ordenExitosa, setOrdenExitosa] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [error, setError] = useState(null);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const carritoGuardado = obtenerLocal('carrito_actual');
    if (carritoGuardado && carritoGuardado.length > 0 && items.length === 0) {
      setItems(carritoGuardado);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (items.length > 0) {
      guardarLocal('carrito_actual', items);
    }
  }, [items]);

  // Intentar sincronizar estadísticas al cargar el componente
  useEffect(() => {
    const sincronizarDatos = async () => {
      try {
        setSincronizando(true);
        await sincronizarEstadisticasLocales();
      } catch (err) {
        console.error('Error al sincronizar estadísticas:', err);
      } finally {
        setSincronizando(false);
      }
    };
    
    sincronizarDatos();
  }, []);

  const calcularTotal = () => {
    return items.reduce((total, item) => {
      const precio = Number(item.precio || item.precio_copa || 0);
      return total + precio;
    }, 0);
  };

  const eliminarItem = (index) => {
    const nuevosItems = [...items];
    nuevosItems.splice(index, 1);
    setItems(nuevosItems);
    
    // Si el carrito queda vacío, eliminar del localStorage
    if (nuevosItems.length === 0) {
      localStorage.removeItem('carrito_actual');
    } else {
      guardarLocal('carrito_actual', nuevosItems);
    }
  };

  const vaciarCarrito = () => {
    setItems([]);
    localStorage.removeItem('carrito_actual');
  };

  const confirmarOrden = async () => {
    if (items.length === 0) return;
    
    setEnviandoOrden(true);
    setError(null);
    
    try {
      const orden = {
        items: items.map(item => ({
          id: item.id,
          nombre: item.nombre,
          precio: Number(item.precio || item.precio_copa || 0),
          categoria: item.categoria || 'sin_categoria'
        })),
        total: calcularTotal(),
        fecha: new Date().toISOString(),
        dispositivo_id: obtenerLocal('dispositivo_id') || 'tablet-' + Math.random().toString(36).substring(2, 9)
      };
      
      // Guardar ID de dispositivo si no existe
      if (!obtenerLocal('dispositivo_id')) {
        guardarLocal('dispositivo_id', orden.dispositivo_id);
      }
      
      // Guardar en localStorage para estadísticas locales
      const ordenesAnteriores = JSON.parse(localStorage.getItem('ordenes_locales') || '[]');
      ordenesAnteriores.push(orden);
      guardarLocal('ordenes_locales', ordenesAnteriores);
      
      // Intentar enviar a Supabase
      try {
        await agregarOrden(orden);
      } catch (error) {
        console.warn('No se pudo enviar a Supabase, guardando localmente:', error);
        // La orden ya está guardada localmente, así que continuamos
      }
      
      setOrdenExitosa(true);
      vaciarCarrito();
      
      // Intentar sincronizar estadísticas
      await sincronizarEstadisticasLocales();
      
      // Reiniciar mensaje después de 3 segundos
      setTimeout(() => {
        setOrdenExitosa(false);
      }, 3000);
    } catch (error) {
      console.error('Error al confirmar orden:', error);
      setError('No se pudo procesar la orden. Será guardada localmente.');
    } finally {
      setEnviandoOrden(false);
    }
  };

  return (
    <div className="carrito-container">
      <h2>Tu Pedido</h2>
      
      {ordenExitosa && (
        <div className="mensaje-exito">
          ¡Orden enviada con éxito!
        </div>
      )}
      
      {error && (
        <div className="mensaje-error">
          {error}
        </div>
      )}
      
      {sincronizando && (
        <div className="sincronizando">
          Sincronizando datos...
        </div>
      )}
      
      {items.length === 0 ? (
        <p>No hay productos en tu pedido</p>
      ) : (
        <>
          <ul className="carrito-items">
            {items.map((item, index) => (
              <li key={`${item.id}-${index}`} className="carrito-item">
                <div className="item-info">
                  <span className="item-nombre">{item.nombre}</span>
                  <span className="item-precio">${Number(item.precio || item.precio_copa || 0).toFixed(2)}</span>
                </div>
                <button 
                  className="btn-eliminar" 
                  onClick={() => eliminarItem(index)}
                  aria-label="Eliminar item"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          
          <div className="carrito-total">
            <span>Total:</span>
            <span>${calcularTotal().toFixed(2)}</span>
          </div>
          
          <div className="carrito-acciones">
            <button 
              className="btn primary" 
              onClick={confirmarOrden}
              disabled={enviandoOrden}
            >
              {enviandoOrden ? 'Enviando...' : 'Confirmar Pedido'}
            </button>
            <button 
              className="btn secondary" 
              onClick={vaciarCarrito}
            >
              Vaciar Pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
}
