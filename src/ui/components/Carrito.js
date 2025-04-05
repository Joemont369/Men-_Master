
import React, { useState } from 'react';
import { agregarOrden } from '../../core/use-cases/agregarOrden';
import { guardarLocal } from '../../infra/localstore/storage';

export default function Carrito({ items, setItems }) {
  const [enviandoOrden, setEnviandoOrden] = useState(false);
  const [ordenExitosa, setOrdenExitosa] = useState(false);

  const calcularTotal = () => {
    return items.reduce((total, item) => total + (item.precio || item.precio_copa || 0), 0);
  };

  const eliminarItem = (index) => {
    const nuevosItems = [...items];
    nuevosItems.splice(index, 1);
    setItems(nuevosItems);
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const confirmarOrden = async () => {
    if (items.length === 0) return;
    
    setEnviandoOrden(true);
    
    try {
      const orden = {
        items: items.map(item => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio || item.precio_copa,
          categoria: item.categoria || 'sin_categoria'
        })),
        total: calcularTotal(),
        fecha: new Date().toISOString()
      };
      
      // Guardar en localStorage para estadísticas locales
      const ordenesAnteriores = JSON.parse(localStorage.getItem('ordenes_locales') || '[]');
      ordenesAnteriores.push(orden);
      guardarLocal('ordenes_locales', ordenesAnteriores);
      
      // Enviar a Supabase
      await agregarOrden(orden);
      
      setOrdenExitosa(true);
      vaciarCarrito();
      
      // Reiniciar mensaje después de 3 segundos
      setTimeout(() => {
        setOrdenExitosa(false);
      }, 3000);
    } catch (error) {
      console.error('Error al confirmar orden:', error);
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
      
      {items.length === 0 ? (
        <p>No hay productos en tu pedido</p>
      ) : (
        <>
          <ul className="carrito-items">
            {items.map((item, index) => (
              <li key={`${item.id}-${index}`} className="carrito-item">
                <div className="item-info">
                  <span className="item-nombre">{item.nombre}</span>
                  <span className="item-precio">${item.precio || item.precio_copa}</span>
                </div>
                <button 
                  className="btn-eliminar" 
                  onClick={() => eliminarItem(index)}
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
